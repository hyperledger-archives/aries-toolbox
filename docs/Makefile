SCRIPTS = $(abspath scripts)
GENERATE_SCRIPT = $(abspath $(SCRIPTS)/geenrate_doc_folders.sh)
readmes := $(shell $\
	find . $\
	-mindepth 3 $\
	-maxdepth 3 $\
	-path scripts -prune -o $\
	-type f -name 'README.md' $\
)

define generate =
@echo scripts/generate_from_readme.awk -v clobber="$(CLOBBER)" "$@"
endef

help:
	@echo "Usage: make docs"

docs: $(readmes)
	@./scripts/generate_doc_folders.sh $(readmes)
