let privateKey = process.env.PRIVATE_KEY

const { Octokit } = require('@octokit/rest')
const { createAppAuth } = require('@octokit/auth-app')

// application level constants
const appId = 62449
const name = 'bundlesize2'

const app = new Octokit({
  authStrategy: createAppAuth,
  auth: { id: appId, privateKey: privateKey.replace(/\\n/g, '\n') },
})

const getInstallation = async ({ owner, repo }) => {
  try {
    const { data } = await app.apps.getRepoInstallation({ owner, repo })
    const installationId = data.id
    return { data: { installationId } }
  } catch (error) {
    console.log({
      method: error.request.method,
      url: error.request.url,
      status: error.status,
      name: error.name,
      documentation_url: error.documentation_url,
    })
    return { error }
  }
}

const getToken = async ({ installationId }) => {
  const { token } = await app.auth({ type: 'installation', installationId })
  return token
}

const createCheck = async ({ token, name, owner, repo, sha, output }) => {
  const octokit = new Octokit({ auth: token })

  await octokit.checks.create({
    name,
    owner,
    repo,
    head_sha: sha,
    conclusion: 'success',
    output,
  })
}

const run = async ({
  repo: repositoryPath,
  sha,
  title = '',
  summary = '',
  text = '',
}) => {
  const owner = repositoryPath.split('/')[0]
  const repo = repositoryPath.split('/')[1]
  console.log('1/4 repo', repositoryPath)

  // check output
  const output = { title, summary, text }
  console.log('1/4 output', output)

  // get installation id for repo
  const { data, error } = await getInstallation({ owner, repo })
  if (error) {
    return {
      status: 404,
      message: `${name} is not installed on this repository. Please configure the application with this link: https://github.com/apps/bundlesize2`,
    }
  }

  const { installationId } = data
  console.log('2/4 installationId', installationId)

  // get auth token
  const token = await getToken({ installationId })
  console.log('3/4 token', token)

  // create check
  await createCheck({ token, name, owner, repo, sha, output })
  console.log('4/4 end of request \n\n')

  return { status: 200, message: 'Added check' }
}

module.exports = run
