SCRIPTS = $(abspath scripts)
GENERATE_SCRIPT = $(abspath $(SCRIPTS)/geenrate_doc_folders.sh)
readmes := $(shell $\
	find . $\
	-mindepth 3 $\
	-maxdepth 3 $\
	-path scripts -prune -o $\
	-type f -name 'README.md' $\
)
generated := $(shell ./scripts/list_files_to_generate.sh $(readmes))

help:
	@echo "Usage: make docs"

docs: $(generated)

clean:
	rm -r $(dir $(generated))

$(generated): $(readmes)
	@./scripts/generate_doc_folders.sh $(readmes)


.PHONY: help docs
