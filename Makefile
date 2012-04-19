DEPS_DIR=node_modules
DEPS=${DEPS_DIR}/jasmine-node

.PHONY: all
all: test

# run tests
.PHONY: test
test: ${DEPS}
	npm test

# fetch dependencies
${DEPS}:
	npm install

# remove installed modules
distclean:
	rm -rf ./node_modules
