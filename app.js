const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "covid19India.db");
const app = express();
app.use(express.json());

let database = null;
const initializeDataserver = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error:${error.message}`);
    process.exit(1);
  }
};
initializeDataserver();

const convertDbobjectToResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};
app.get("/states/", async (request, response) => {
  const getallstates = `
    SELECT * FROM state`;
  const getstate = await database.all(getallstates);
  response.send(
    getstate.map((eachstate) => convertDbobjectToResponseObject(eachstate))
  );
});
app.get("/states/:stateId/", async (request, response) => {
  const { stateId, stateName, population } = request.params;
  const getallstates = `
    SELECT * FROM state`;
  const getstate = await database.all(getallstates);
  response.send(convertDbobjectToResponseObject(getstate));
});

app.post("/districts/", async (request, response) => {
  const { stateId, stateName, population } = request.body;
  const postalldisticts = `
    INSERT INTO district(state_id,district_name,cases,cured,active,deaths) VALUES(${stateid},'${districtName}',${cases},${cured},${active},${deaths});`;
  const postdistrict = await database.run(postalldisticts);
  response.send("District Successfully Added");
});
app.get("/districts/:districtId/", async (request, response) => {
  const getallstates = `
    SELECT * FROM district`;
  const getstate = await database.all(getallstates);
  response.send(convertDbobjectToResponseObject(getstate));
});
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.body;
  const deleteAllactors = `
    DELETE FROM district WHERE district_id='${districtId}';
    `;
  const movieArray = await database.run(deleteAllactors);
  response.send("District Removed");
});
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.body;

  const putAllactors = `
    UPDATE district SET district_id='${districtId}',state_id='${stateId}' WHERE district_id='${districtId}';`;
  const movieArray = await database.run(putAllactors);
  response.send("District Details Updated");
});
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districrId } = request.params;
  const getallstates = `
    SELECT * FROM district`;
  const getstate = await database.all(getallstates);
  response.send(convertDbobjectToResponseObject(getstate));
});
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId, stateName, population } = request.params;
  const getallstates = `
    SELECT state_id FROM district WHERE district_id=${districtId};`;
  const getstate = await database.get(getallstates);
  const getDistrictIdQueryResponse = await database.get(getallstates);
  const getStateNameQuery = `
    select state_name as stateName from state
    where state_id = ${getDistrictIdQueryResponse.state_id}`;
  const getStateNameQueryResponse = await database.get(getStateNameQuery);
  response.send(convertDbobjectToResponseObject(getstateNameQueryResponse));
});

module.exports = app;
