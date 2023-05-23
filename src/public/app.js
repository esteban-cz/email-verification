function nameError() {
  document.getElementById('name-error').style.display = 'none';
}

function surnameError() {
  document.getElementById('surname-error').style.display = 'none';
}

function emailError() {
  document.getElementById('email-error').style.display = 'none';
}

function codeError() {
  document.getElementById('code-error').style.display = 'none';
}

document.getElementById('verificationCode').addEventListener('input', function(event) {
  const input = event.target;
  let value = input.value.replace(/[^0-9]/g, '');

  if (value.length > 3) {
    value = value.slice(0, 3) + '-' + value.slice(3);
  }

  input.value = value;
});

document.getElementById("form").addEventListener("submit", function (event) {
  event.preventDefault();

  var name = document.getElementById("name").value;
  var surname = document.getElementById("surname").value;
  var email = document.getElementById("email").value;
  const form = document.getElementById("form");
  const form_verify = document.getElementById("form-verify");
  const header = document.querySelector(".header");
  const message = document.querySelector(".message");
  var success_message = document.querySelector(".message.hidden");

  var hasError = false;

  if (name.trim() === '') {
    document.getElementById('name-error').style.display = 'block';
    hasError = true;
  } else {
    document.getElementById('name-error').style.display = 'none';
  }

  if (surname.trim() === '') {
    document.getElementById('surname-error').style.display = 'block';
    hasError = true;
  } else {
    document.getElementById('surname-error').style.display = 'none';
  }

  if (email.trim() === '') {
    document.getElementById('email-error').style.display = 'block';
    hasError = true;
  } else {
    document.getElementById('email-error').style.display = 'none';
  }

  if (name.trim() !== '' && surname.trim() !== '' && icp.trim() !== '' && email.trim() !== '') {
    hasError = false; 
  }

  if (hasError) {
    return;
  }

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

  var hasError = false;

  if (verificationCode.trim() === '') {
    document.getElementById('code-error').style.display = 'block';
    hasError = true;
  } else {
    document.getElementById('code-error').style.display = 'none';
    hasError = false;
  }

  if (hasError) {
    return;
  }

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
