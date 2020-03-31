install: 
	npm install

develop:
	npx webpack-dev-server

build:
	rm -rf dist
	NODE_ENV=production npx webpack

install-deps:
	npm install

installBabel:
	npm install --save-dev @babel/core @babel/cli @babel/node @babel/preset-env

publish:
	npm publish --dry-run

link:
	npm link

test:
	npm test

testWatch:
	npx jest --watch

lint:
	npx eslint .
	
webpack:
	npx webpack