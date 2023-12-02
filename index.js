import fetch from "node-fetch";
import express from "express";

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let UserLists = [];

async function fetchData() {
  const response = await fetch(
    "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
  );
  UserLists = await response.json();
}

fetchData().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

app.get("/", (req, res) => {
  const page_len = 10;
  const page_num = parseInt(req.params.page_num, 10) || 1;

  const start = (page_num - 1) * page_len;
  const end = start + page_len;

  const UserData = UserLists.slice(start, end);
  const totalPages = Math.ceil(UserLists.length / page_len);

  res.render("home", {
    data: UserData,
    currentPage: page_num,
    totalPages,
  });
});

app.get("/page/:page_num", (req, res) => {
  const page_len = 10;
  const page_num = parseInt(req.params.page_num, 10) || 1;

  const start = (page_num - 1) * page_len;
  const end = start + page_len;

  const UserData = UserLists.slice(start, end);
  const totalPages = Math.ceil(UserLists.length / page_len);

  res.render("home", {
    data: UserData,
    currentPage: page_num,
    totalPages,
  });
});

app.get("/search/:query/:page_num", (req, res) => {
  const query = req.params.query.toLowerCase();
  const page_len = 10;
  const page_num = parseInt(req.params.page_num, 10) || 1;

  const filter_data = UserLists.filter((user) =>
    Object.values(user).some((value) =>
      value.toString().toLowerCase().includes(query)
    )
  );

  const start = (page_num - 1) * page_len;
  const end = start + page_len;

  const UserData = filter_data.slice(start, end);
  const totalPages = Math.ceil(filter_data.length / page_len);

  res.render("home", {
    data: UserData,
    currentPage: page_num,
    totalPages,
  });
});

app.get("/edit/:id", (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = UserLists.find((u) => parseInt(u.id) === userId);
  if (!user) {
    return res.status(404).send("User not found");
  }

  res.render("edit", { user });
});

app.post("/edit/:id", (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { name, email } = req.body;

  const userIndex = UserLists.findIndex((u) => parseInt(u.id) === userId);
  if (userIndex !== -1) {
    UserLists[userIndex].name = name;
    UserLists[userIndex].email = email;
  }
  res.redirect("/");
});

app.get("/delete/:id", (req, res) => {
  const { id } = req.params;
  UserLists = UserLists.filter(
    (user) => parseInt(user.id) !== parseInt(id, 10)
  );

  res.redirect("/");
});

app.post("/delete-selected", (req, res) => {
  const selectedIds = req.body.selectedIds.map((id) => parseInt(id, 10));
  selectedIds.forEach((id) => {
    UserLists = UserLists.filter(
      (user) => parseInt(user.id) !== parseInt(id)
    );
  });
  res.redirect("/");
});

