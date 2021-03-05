SCRIPTS = $(abspath scripts)
GENERATE_SCRIPT = $(abspath $(SCRIPTS)/geenrate_doc_folders.sh)
readmes := $(shell $\
	find . $\
	-mindepth 3 $\
	-maxdepth 3 $\
	-path scripts -prune -o $\
	-type f -name 'README.md' $\
	-printf "%P " $\
)
generated := $(shell ./scripts/list_files_to_generate.sh $(readmes))

help:
	@echo "Usage: make [TARGET TARGET...]"
	@echo "Targets: help clean docs"
	@echo -e "  make docs\t\tGenerate docs from central readmes"
	@echo -e "  make clean\t\tRemove all generated docs"
	@echo -e "  make clean docs\tRegenerate all docs"

docs: $(generated)

clean:
	-rm -r $(dir $(generated))

$(generated): $(readmes)
	@./scripts/generate_doc_folders.sh $(readmes)


.PHONY: help docs clean
