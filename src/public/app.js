document.getElementById("form").addEventListener("submit", function (event) {
  event.preventDefault();

  var name = document.getElementById("name").value;
  var surname = document.getElementById("surname").value;
  var email = document.getElementById("email").value;
  const form = document.getElementById("form");
  const form_verify = document.getElementById("form-verify");
  const header = document.querySelector(".header");
  const button = document.querySelector("button");
  const message = document.querySelector(".message");
  var success_message = document.querySelector(".message.hidden");
  var verificationCode = document.getElementById("verificationCode").value;

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/email/send_email", true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        success_message.innerHTML = xhr.responseText;
        header.classList.add("hidden");
        form.classList.add("hidden");
        message.classList.remove("hidden");
        form_verify.classList.remove("hidden");
        ani();
      } else {
        if (xhr.handled !== true) {
          if (xhr.status === 500) {
            alert("This email adress does not exist");
            xhr.handled = true;
          }
          if (xhr.status === 400) {
            alert("This email adress is already verified");
            xhr.handled = true;
          }
        }
      }
    }
  };
  xhr.send(
    "name=" + encodeURIComponent(name) +
    "&surname=" + encodeURIComponent(surname) +
    "&email=" + encodeURIComponent(email)
  );
});
document.getElementById("form-verify").addEventListener("submit", function (event) {
  event.preventDefault();

  var verificationCode = document.getElementById("verificationCode").value;

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/email/verify", true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        // window.location.href = '/finish.html';
        window.location.reload();
      } else {
        alert("Wrong verification code, try again");
      }
    }
  };
  xhr.send("verificationCode=" + encodeURIComponent(verificationCode));
});
