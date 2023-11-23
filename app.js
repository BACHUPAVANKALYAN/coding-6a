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
const convertDistrictdbobjecttoresponseobject = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
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
  const { stateId } = request.params;
  const getallstates = `
    SELECT * FROM state  WHERE state_id=${stateId};`;
  const getstate = await database.get(getallstates);
  response.send(convertDbobjectToResponseObject(getstate));
});

app.post("/districts/", async (request, response) => {
  const { stateId, districtName, cases, cured, active, deaths } = request.body;
  const postalldisticts = `
    INSERT INTO district(state_id,district_name,cases,cured,active,deaths) VALUES(${stateId},'${districtName}',${cases},${cured},${active},${deaths});`;
  const postdistrict = await database.run(postalldisticts);
  response.send("District Successfully Added");
});
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getallstates = `
    SELECT * FROM district WHERE district_id=${districtId};`;
  const getstate = await database.get(getallstates);
  response.send(convertDistrictdbobjecttoresponseobject(getstate));
});
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteAllactors = `
    DELETE FROM district WHERE district_id=${districtId};`;
  const movieArray = await database.run(deleteAllactors);
  response.send("District Removed");
});
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const putAllactors = `
        UPDATE district SET district_name='${districtName}',state_id=${stateId},cases=${cases},cured=${cured},active=${active},deaths=${deaths}  WHERE district_id=${districtId}`;
  const movieArray = await database.run(putAllactors);
  response.send("District Details Updated");
});
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getallstates = `
    SELECT SUM(cases) AS totalCases,SUM(cured) AS totalCured,SUM(active) AS totalActive,SUM(deaths) AS totalDeaths FROM district WHERE state_id=${stateId};`;
  const getstate = await database.get(getallstates);
  response.send(getstate);
});
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getallstates = `
    SELECT state_id FROM district WHERE district_id=${districtId}`;
  const getstate = await database.get(getallstates);
  const distictquery = `SELECT state_name AS stateName FROM state WHERE state_id=${getallstates.state_id}`;
  const getStateNameQueryResponse = await database.get(distictquery);
  response.send(getStateNameQueryResponse);
});
module.exports = app;
