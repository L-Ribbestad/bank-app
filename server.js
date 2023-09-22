import express from "express";
import { MongoClient, ObjectId} from "mongodb";

const port = 3001;
const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded());

const client = new MongoClient("mongodb://127.0.0.1:27017");
await client.connect();
const db = client.db("bank");
const accountCollection = db.collection("accounts");

app.get("/api/accounts", async (req, res) => {
    let accounts = await accountCollection.find({}).toArray();
    res.json(accounts);
});

app.get("/api/accounts/:id", async (req, res) => {
    const account = await accountCollection.findOne({ _id: new ObjectId(req.params.id) });
    res.json(account);
});

app.post("/api/accounts", async (req, res) => {
  const account = {
    ...req.body
  };
  await accountCollection.insertOne(account);
  res.json({
    success: true,
    account
  });
});

app.put("/api/accounts/:id", async (req, res) => {
    let account = await accountCollection.findOne({ _id: new ObjectId(req.params.id) });
    let updatedMoney;
    if(req.body.addOrRemove === "add"){
      updatedMoney = parseInt(account.accountMoney) + parseInt(req.body.accountMoney);
    }else{
      updatedMoney = parseInt(account.accountMoney) - parseInt(req.body.accountMoney);
    };
  account = {
    ...account,
    accountMoney: updatedMoney
  };
  await accountCollection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: account });
  res.json({
    success: true,
    account
  });
});

app.delete("/api/accounts/:id", async (req, res) => {
    await accountCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.status(204).send();
  });


app.listen(port, () => console.log(`Listening on ${port}`));
