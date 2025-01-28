Those hooks have to be setup locally on each machine.

In order to make hooks work:
1. Setup git config hooks dir to point to this folder: `git config --local core.hooksPath .githooks/`
2. You might need to make the hooks executable by running `chmod +x prepare-commit-msg`

