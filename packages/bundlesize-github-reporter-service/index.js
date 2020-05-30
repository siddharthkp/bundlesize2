const check = require('./_check')

module.exports = async (req, res) => {
  const data = req.body
  console.log(data)
  if (!data) {
    res.json({ message: '200 Okay' })
    return
  }

  try {
    const { status, message } = await check(data)
    res.status(status).json({ message })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: `
        Something broke pretty bad!

        Please create an issue with this error message: ${error}
    `,
    })
  }
}
