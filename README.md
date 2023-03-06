# bookstore-rdbms

## Development guide:

### Prerequisite

- Node.js version >= 16.18
- Docker is installed

### Setup Dev environment

First, clone this project:

```bash
git clone https://github.com/ducthuy-ng/bookstore-rdbms
```

Then, run script setup the development environment:

```bash
npm run setup-dev
```

You are now ready to code.

### Start Docker

If your task includes Docker, run the following script

```bash
npm run start:dev-container
```

When finished with Docker, you can run this script to stop all the container

```bash
npm run stop:dev-container
```

> You can use the `stop:dev-container` command to reset Docker when an error occurred

### Start dev server

To start dev server, just run

```bash
npm run dev
```

This will run the development server in the current shell. If you want to stop this server, press `Ctrl+C` in the shell.

### Linting and Formatting

Before commit, you should run 2 following line, 1 at a time:

```bash
npm run lint
```

```bash
npm run format
```

The first line run ESLint for static checking. The second one format the code to a convention.
