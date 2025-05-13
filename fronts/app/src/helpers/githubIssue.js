import newGithubIssueUrl from "new-github-issue-url";

export default newGithubIssueUrl({
  user: 'runeya',
  repo: 'runeya',
  body: `
## Issue

### Plateform
\`\`\`<Windows10, Archlinux, MacOS...>\`\`\`

### Configuration file
\`\`\` javascript
<upload your configuration file but without sensitive infos>
\`\`\`

### Description
\\<Which part of this application bug...>


### Reproduction 
\\<Step to bug...>

        `
});