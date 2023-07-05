const loginForm = document.getElementById("login-form");
let accessToken = "";

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  let formData = new FormData(loginForm);
  const data = Object.fromEntries(formData);

  const form = e.currentTarget;
  const url = form.action;

  console.log(data);
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      // "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  console.log(response);
  let result = await response.json();
  console.log(result);
  accessToken = result.accessToken;
  // localStorage.setItem("accessToken", accessToken);

  fetch("/create-chat", {
    headers: {
      Authorization: "Bearer " + accessToken,
    },
    //   // redirect: "follow",
  })
    .then((res) => res.text())
    .then((res) => {
      // const div = document.createElement("div");
      // div.innerHTML = res;

      // document.body.appendChild(div);

      // if needed full page update

      const nextURL = "http://localhost:3000/create-chat";
      const nextTitle = "Create Chat";
      window.history.replaceState(nextTitle, nextURL);
      document.body.innerHTML = res;
    });

  // window.location.href = "/create-chat";
});
