# Activity 1: Credentials Exchange with Sovrin
* A. Start the Aries Cloud Agent (if it is not already running)
    1.  ```console
        aries-cloudagent-python
        ```
    2.  ```console
        docker-compose -f docker-compose_multiple.yml up
        ```
        -   Notice that there are two “Invitation URL”s, for a Company and Holder Agent.  Company and Holder AgentsThese will be used throughout the activities. Note: The invitation URLs change each time you start the docker container.
* B. Start the Aries Toolbox
    1.  ```console
        cd ~/dev/aries-toolbox
        ```
    2.  ```console
        npm run dev
        ```
        - The Aries Toolbox is a UI or console for administrating Agents, and is used in the activities to administer to the Company and Holder Agents.
* C. Connect the Aries Toolbox to Company and Holder Agents
    1.  Paste the first Invitation URL from the aries-cloud-agent screen into the `“Paste Agent Invite”` box.
    2.  Click `"Add"`. A new connection between Aries Toolbox and the Agent from the invitation should appear.
    3.  Paste the second Invitation URL from the aries-cloud-agent screen into the `“Paste Agent Invite”` box.
    4.  Click `"Add"`. Just as before, a second new connection between Aries Toolbox and the Agent from the invitation should appear.
    5.  Click `“Connect”` under `“Company (admin)”`
        -   This queries Company Agent for its current state. At the same time a new administrative window will open. This window will be used to manage your Company Agent.
    5. On the first admin window, Click `“Connect”` under `“Holder (admin)”`
        -  Simular to earlier step, this queries Holder Agent for its current state. At the same time a new administrative window will open. This window will be used to manage your Holder Agent.
* D. Connect your Holder agent to Sovrin's agent
    1.  Go to the `“Holder (admin)”` admin window.
    2.  Click on the `“Connections”` tab.
    3.  Paste the following Sovrin Agent invitation URL into the `“Invitation URL”` box under `“Add connection from invitation”`:
    ```console
        https://agent.sovrin.org/?c_i=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiNjBhNjY1OGUtMDYzZS00MTcyLWIyN2ItZmZlYzJjMzY2N2ZiIiwgInNlcnZpY2VFbmRwb2ludCI6ICJodHRwczovL2FnZW50LnNvdnJpbi5vcmcvIiwgImxhYmVsIjogIlNvdnJpbiBBZ2VudCIsICJyZWNpcGllbnRLZXlzIjogWyIzR3p2NEhZb2ZXNUp5WGd2YzdBeGVhNmVVWkdkTEJ1Rk43NHRjVzVmb0gxRyJdfQ==
    ```
    4.  Click `“Add”`.
        -   You should now have a connection between the Holder Agent and the Sovrin Agent, with a connection name `“Sovrin Agent”`. The connection first appears in your `“Pending Invitations”` list and then moves to your “Active Connections” list.
* E. Receive a verifiable credential from the Sovrin Agent
    1.  Select the `“My Credentials”` tab.	
    2.  In the input text box for `"Retrieved Credential Definitions"`, paste in  `HQHxEmkdFWvfxZVopvC63y:3:CL:75048:BasicID_1.0`.
    3. Click on `"Retrieve"` to get the Sovrin's BasicID 1.0 credential definition.
        -   The credential definition should appear in your Retrieved Credential Definitions list. Depending on network use, this could take up to 15 seconds.
    4.  Next to `“Credentials”` click  `“Send Credential Proposal”` and fill in the fields as follows (Note: you can use “tab” key to navigate to the next fields or click in each field, then enter your value):
        *   a) For `“Connection”` select the `"Sovrin Agent"` connection
        *   b) For `“Credential Definition”` select the credential definition you just `"received"` or read from the ledger.
        *   c) Make an appropriate comment if desired.
        *   d) Fill in the fields that are now displayed below the `“Comment”` box pertaining to yourself as the Holder (PI not required). If you do not see any fields displayed, please make sure you selected the correct `“Credential Definition”` as noted earlier in this section.
        *   e) Click `“Confirm”`.
    5.  The credential should be issued by the Sovrin Agent automatically and will appear in your `“Credentials”` list. If it does not appear within a few seconds, click the refresh button.
# Master Summary
    ...