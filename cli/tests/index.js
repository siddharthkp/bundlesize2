const test = require('ava')
const { commandSync: cmd } = require('execa')

const bundlesize = `node ../../../index`

function run(fixture, customParams = '') {
  let output

  try {
    output = cmd(`${bundlesize} ${customParams}`, {
      cwd: `tests/fixtures/${fixture}`,
      env: process.env.LOCAL
        ? {
            CI: 'LOCAL',
            CI_REPO_OWNER: 'test',
            CI_REPO_NAME: 'test',
            CI_COMMIT_SHA: 'test',
            CI_BRANCH: 'main', // uncomment this line to test saving
          }
        : {
            INTERNAL_SKIP_CACHE: true,
          },
    })
  } catch (error) {
    output = error
  }

  // make it a little easier to compare
  output.stdout = output.stdout.trim()

  return output
}

test.serial('1. pass: single file smaller than limit', t => {
  const { stdout, exitCode } = run(1)
  t.is(exitCode, 0)
  t.snapshot(stdout)
})

test.serial('2. fail: single file larger than limit', t => {
  const { stdout, exitCode } = run(2)
  t.is(exitCode, 1)
  t.snapshot(stdout)
})

test.serial('3. pass: use brotli', t => {
  const { stdout, exitCode } = run(3)
  t.is(exitCode, 0)
  t.snapshot(stdout)
})

test.serial('4. fail: dont use compression', t => {
  const { stdout, exitCode } = run(4)
  t.is(exitCode, 1)
  t.snapshot(stdout)
})

test.serial('5. pass: custom config file', t => {
  const { stdout, exitCode } = run(5, '--config config/bundlesize.json')
  t.is(exitCode, 0)
  t.snapshot(stdout)
})

test.serial('6. pass: multiple files, both smaller than limit', t => {
  const { stdout, exitCode } = run(6)
  t.is(exitCode, 0)
  t.snapshot(stdout)
})

test.serial('7. fail: multiple files, both bigger than limit', t => {
  const { stdout, exitCode } = run(7)
  t.is(exitCode, 1)
  t.snapshot(stdout)
})

test.serial('8. fail: multiple files, 1 smaller + 1 bigger than limit', t => {
  const { stdout, exitCode } = run(8)
  t.is(exitCode, 1)
  t.snapshot(stdout)
})

test.serial('9. pass: catch all js files', t => {
  const { stdout, exitCode } = run(9)
  t.is(exitCode, 0)
  t.snapshot(stdout)
})

test.serial('10. pass: match by fuzzy name', t => {
  const { stdout, exitCode } = run(10)
  t.is(exitCode, 0)
  t.snapshot(stdout)
})

test.serial('11. bug repro: bundlesize should dedup files', t => {
  const { stdout, exitCode } = run(11)
  t.is(exitCode, 0)
  t.snapshot(stdout)
})

test.serial(
  '12. deduped files with the same specificty should pick the latter one',
  t => {
    const { stdout, exitCode } = run(12)
    t.is(exitCode, 0)
    t.snapshot(stdout)
  }
)

test.serial(
  '13. dont dedup files with same path but different compression',
  t => {
    const { stdout, exitCode } = run(13)
    t.is(exitCode, 0)
    t.snapshot(stdout)
  }
)

test.serial(
  '14. pass: precompressed Brotli files should report the correct size',
  t => {
    const { stdout, exitCode } = run(14)
    t.is(exitCode, 0)
    t.snapshot(stdout)
  }
)

test.serial(
  '15. pass: precompressed Gzip files should report the correct size',
  t => {
    const { stdout, exitCode } = run(15)
    t.is(exitCode, 0)
    t.snapshot(stdout)
  }
)
