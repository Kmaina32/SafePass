Initialize a Git repository in your project's root directory:

git init -b main

Add all your files to the new repository:

git add .

Commit the files:

git commit -m "Initial commit"

Create a new repository on GitHub: Go to github.com/new and create a new repository. You can name it whatever you like, for example, safepass-app.

Link your local repository to the one on GitHub: Make sure to replace <your-repository-url> with the URL you get from GitHub after creating the repository.

git remote add origin https://github.com/Kmaina32/SafePass

Push your code to GitHub:

git push -u origin main