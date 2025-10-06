const { Umzug, SequelizeStorage } = require('umzug')
const sequelize = require('../../src/db/sequelize');

const umzug = new Umzug({
  migrations: { glob: './src/db/seeders/*' },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: undefined,
})

const upSeed = async () => {
  try {
    await sequelize.sync({ force: true })
    await umzug.up()
  } catch (err) {
    console.error(err);
  }
}

const downSeed = async () => {
  await sequelize.drop({ force: true }); // Borrando las tablas
}

module.exports = {
  upSeed,
  downSeed
}
