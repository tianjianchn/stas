
# Contributing

### Setup
```bash
git clone https://github.com/tianjianchn/stas
cd stas
npm install
npm run bootstrap
```

### Develop
```bash
npm run build # Build once
npm run watch # Build all, then watch each package `src` files and build if changed
npm run test:only # No build task involved
npm test # Run lint, clean, build and test:only tasks
```

### Release
```bash
npm run publish
```
