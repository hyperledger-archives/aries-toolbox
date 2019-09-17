const rp = require('request-promise');
import DIDComm from 'encryption-envelope-js'

const state = {
  agent_list: [{"id":1568054784690,"label":"Aries Cloud Agent","did_doc":{"@context":"https://w3id.org/did/v1","id":"did:sov:EK546KmK3kHgKwNQMsows9","publicKey":[{"id":"did:sov:EK546KmK3kHgKwNQMsows9#1","type":"Ed25519VerificationKey2018","controller":"did:sov:EK546KmK3kHgKwNQMsows9","publicKeyBase58":"8FoemJVFroSRWou8mD4d4aHrAvvT6SwaZn7qiaP4nDi6"}],"authentication":[{"type":"Ed25519SignatureAuthentication2018","publicKey":"did:sov:EK546KmK3kHgKwNQMsows9#1"}],"service":[{"id":"did:sov:EK546KmK3kHgKwNQMsows9;indy","type":"IndyAgent","priority":0,"recipientKeys":["8FoemJVFroSRWou8mD4d4aHrAvvT6SwaZn7qiaP4nDi6"],"serviceEndpoint":"https://agent.sovrin.org/"}]},"my_key":{"publicKey":{"0":32,"1":235,"2":97,"3":254,"4":26,"5":174,"6":182,"7":250,"8":70,"9":11,"10":197,"11":53,"12":146,"13":131,"14":115,"15":232,"16":153,"17":31,"18":56,"19":187,"20":27,"21":148,"22":201,"23":211,"24":238,"25":50,"26":13,"27":36,"28":14,"29":192,"30":225,"31":198},"privateKey":{"0":179,"1":83,"2":137,"3":18,"4":218,"5":126,"6":129,"7":160,"8":173,"9":195,"10":255,"11":5,"12":137,"13":197,"14":80,"15":151,"16":176,"17":72,"18":170,"19":97,"20":67,"21":86,"22":231,"23":205,"24":245,"25":67,"26":150,"27":83,"28":159,"29":153,"30":36,"31":85,"32":32,"33":235,"34":97,"35":254,"36":26,"37":174,"38":182,"39":250,"40":70,"41":11,"42":197,"43":53,"44":146,"45":131,"46":115,"47":232,"48":153,"49":31,"50":56,"51":187,"52":27,"53":148,"54":201,"55":211,"56":238,"57":50,"58":13,"59":36,"60":14,"61":192,"62":225,"63":198},"keyType":"ed25519","did":"54mnFtk6m42eVpRmaHSBTM","publicKey_b58":"3DWDmGT1pk58fUhhUBvhxFscufBJVwAtGPaDCnAQsWYD","privateKey_b58":"4awyUvWVRau5kmTjUsTec1x9MqHEucuyXLHXnvFyVhKnKfaoQHyVLtN54SPmYheMZ3v1E8LpFuMKffuuFnw7C7NM"}}]
}

const mutations = {
  ADD_CONNECTION (state, detail) {
    state.agent_list.push(detail);
  },
  DELETE_CONNECTION (state, label) {
    state.agent_list = state.agent_list.filter(function(element, index, arr){
      return element.label != label;
    });
  }
};

const actions = {
  add_connection (context, detail) {
    // do something async
    console.log("add_connection called", detail);
    context.commit('ADD_CONNECTION', detail);
  },
  delete_connection (context, detail) {
    // do something async
    console.log("add_connection called", detail);
    context.commit('DELETE_CONNECTION', detail.label);
  },
  get_connection (context, id) {
    // do something async
    let detail = context.state.agent_list.find(function(element){
      return element.id == id;
    });
    return detail;
  },
  send_connection_request (context, request_options, toolbox_did, didcomm) {
    console.log("send_connection_request called")
    return new Promise((resolve, reject) => {
      // Do something here... lets say, a http call using vue-resource
      rp(request_options).then(parsedBody => {
        // POST succeeded...
        //console.log("request post response", parsedBody);
        const unpackedResponse = didcomm.unpackMessage(parsedBody, toolbox_did);
        //console.log("unpacked", unpackedResponse);
        const response = JSON.parse(unpackedResponse.message);
        //console.log("response message", response);
        //TODO: Validate signature against invite.
        //console.log("connection sig b64 data", response['connection~sig'].sig_data);
        let buff = new Buffer(response['connection~sig'].sig_data, 'base64');
        let text = buff.toString('ascii');
        //first 8 chars are a timestamp for the signature, so we ignore those before parsing value
        response.connection = JSON.parse(text.substring(8));
        console.log("response message", response);
          let connection_detail = {
              'id': new Date().getTime(), //FIXME:
              'label': invite.label,
              'did_doc': response.connection.DIDDoc,
              'my_key': toolbox_did
          };
          console.log("connection detail", connection_detail);
          context.commit('ADD_CONNECTION', detail);
          resolve(response);  // Let the calling function know that http is done.
      }, error => {
          // http failed, let the calling function know that action did not work out
          reject(error);
      })
    })
  }
};

export default {
  //namespaced: true,  // this done in store/index.js
  state,
  mutations,
  actions,
};
