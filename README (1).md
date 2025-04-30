# ForumFrontend

## About ForumFrontend

This repository is home to the frontend of the Litinsight Forum, which is a companion web app to Knowlecy's Litinsight. This web app adds another dimension to Knowlecy's ecosystem of AI research by letting users interact with each other through a dedicated forum, where they can make posts fully supported by markdown to talk about topics related to AI research. Users can also upvote/downvote posts, make comments and replies under those posts, and even save posts to wach later. As requested by Knowlecy, this is an all-new web app that works in conjunction with Knowlecy's Litinsight, and is not literally a part of it in terms of codebase (though we did try to use the same tools and structure as their frontend codebase where applicable).

### Integration with Knowlecy applications

As the main frontend for the Litinsight Forum, this repo is what lets users interact with all of the other services we made for this project, letting them complete actions related to forum posts and notifications. For more information, see the below system diagram representing the architecture of our Litinsight Forum web app:

![image](https://github.com/user-attachments/assets/1afe3eff-07aa-43b8-8520-a1863170cd97)

### System diagram explanation

* This repo contains the code for Forum Frontend, the bottom left box in this diagram.
* This repo connects with [ForumDB](https://github.com/csc301-2025-s/ForumDB) through CRUD operations facilitated through TypeScript Fetch. That repo then interacts with our Neo4j database (which is different than Knowlecy's database), where information relating to the Litinsight Forum (posts, comments, replies, upvotes/downvotes, etc.) are stored.
* This repo connects with Knowlecy's Authentication API through a slightly modified version of [their frontend](https://github.com/csc301-2025-s/csc301-7-Frontend-Next.js), which has a modified version of their auth flow that lets us use the same auth flow setup (same login page, credentials, token, etc.) that they already use for Knowlecy's Litinsight log in and use the Litinsight Forum app. Their frontend then requests an access token generated with JWT, then validates the information with Knowlecy's Neo4j database (not ours).
* This frontend also makes API calls to our [Event Processing API](https://github.com/csc301-2025-s/EventProcessingAPI) and [Notification Listener](https://github.com/csc301-2025-s/NotificationListener) services, which we also developed from the ground-up. Go to their linked repos to learn more about how they work and what they are used for (spoiler: they're used for delivering notifications and letting the user save posts to be notified about). These repos have diagrams you can look at to see how they interact with this repo, and the rest of the parts of the Litinsight Forum web app.

## Development Instructions

### Prerequisites

- [Node.js](https://nodejs.org/en/download) (Version 20 or higher is recommended)
- [pnpm](https://pnpm.io/installation#using-npm)

### Install Dependencies

Install the frontend's dependencies:

```bash
pnpm install
```

### Environment Variables

The frontend communicates with several backend services and determines their locations from environment variables. The environment variables provided in the [.env](/.env) file at the root of the repository are suited to local development.

### Start the Application

Start the application:

```bash
pnpm run dev
```

You should see output similar to the following:

```
   ▲ Next.js 14.1.4
   - Local:        http://localhost:3000
   - Environments: .env

 ✓ Ready in #.#s
```

### Branching Strategy
- **Main Branch**: Production-ready code only
- **Development Branch**: Integration branch for features
- **Feature Branches**: Created from development for individual features
(format: `feature/feature-name`)
- **Hotfix Branches**: For urgent production fixes
(format: `hotfix/issue-description`)

### Development Workflow
1. Create a feature branch from development
2. Implement your changes with frequent commits
3. Write tests for new functionality
4. Open a PR to the development branch
5. Address review comments
6. Merge to development after approval
7. Development is periodically merged to main for releases

### Code Review Process
- All PRs require at least one reviewer
- Reviewers should check:
    - Code quality and adherence to style guidelines
    - Documentation updates
    - Performance considerations
- Use GitHub's review features for inline comments

### Handling Merge Conflicts
1. Always pull the latest changes from the target branch before creating a PR
2. If conflicts occur:
    - Merge the target branch into your feature branch
    - Resolve conflicts locally
    - Test thoroughly after resolution
    - Push updated branch

## Testing this application

This repo was made following the structure and precedents set by Knowlecy's Litinsight frontend, as per their request. Since their frontend repo didn't include any tests, we didn't add any tests to ours either. This decision was fine by them, and follows what they have set up with their code. So, there are no tests to run regarding the code in this repo, going off of Knowlecy's standards and what they have set up for us. That being said, we did extensively manually pressure-test the application, and adjust our code accordingly with concurrency, optimistic rendering, and transactions.

## Deployments

For information on how the frontend is built and deployed, see the [GitHub Actions workflow](/.github/workflows/build_image_and_deploy.yml).

**⚠️WARNING: USE GOOGLE CHROME BEFORE PROCEEDING INTO ANY OF THE LINKS. APPLICATION MAY BREAK ON OTHER BROWSERS⚠️**

There is currently a deployment of our Forum Frontend:
* A staging deployment based on the `main` branch, deployed at https://forum-stg.knowlecy.ai/

### Product Login Credentials

A [Litinsight](https://litinsight.com/auth/login) account will be required to authenticate into our forum. Here is a test account you may use, provided by one of our developers:

- Email: ben.sandoval@mail.utoronto.ca
- Password: 1SV8@lf&q#n8

> *By using this account, you agree to only use these credentials for application testing/previewing purposes, and will not act maliciously.*
