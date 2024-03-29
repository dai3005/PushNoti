function notifyMe() {
  if (!("Notification" in window)) {
    // Check if the browser supports notifications
    alert("This browser does not support desktop notification");
  } else if (Notification.permission === "granted") {
    // Check whether notification permissions have already been granted;
    // if so, create a notification
    const notification = new Notification("Hi there!");
    // …
  } else if (Notification.permission !== "denied") {
    // We need to ask the user for permission
    Notification.requestPermission().then((permission) => {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        const notification = new Notification("Hi there!");
        // …
      }
    });
  }

  // At last, if the user has denied notifications, and you
  // want to be respectful there is no need to bother them anymore.
}

const button = document.getElementById("subabc");
console.log(button);
if (!button) {
  console.log("No button");
} else {
  button.addEventListener("click", async () => {
    // Triggers popup to request access to send notifications
    const result = await window.Notification.requestPermission();

    // If the user rejects the permission result will be "denied"
    if (result === "granted") {
      // You must use the service worker notification to show the notification
      // Using new Notification("Hello World", { body: "My first notification on iOS"}) does not work on iOS
      // despite working on other platforms
      await registration.showNotification("Hello World", {
        body: "My first notification on iOS",
      });
    }
  });
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
const urlBase = "https://portal-sdl-dev.vivas.vn/hieupm";
let publicKey =
  "BEEpnOVYoaVikBR02ra8N7Q_nuVr6TDoilD12ze-TjuMQxzZgHYS76vxVhn7Peba4vTncocKqBegYdlewqCjCto";

function subscribe() {
  navigator.serviceWorker.ready
    .then(function (registration) {
      const vapidPublicKey = publicKey;
      return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    })
    .then(function (subscription) {
      let subs = getCookie("subscription");
      if (subs == "") {
        setSubscription(JSON.stringify(subscription));
      }
    })
    .catch((err) => console.error(err));
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

const setSubscription = async (subscription) => {
  let model = {
    app_id: 0,
    identify: subscription,
    public_key: publicKey,
    subscription: subscription,
  };
  let rq = await fetch(`${urlBase}/api/v1/set_subscription`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(model),
  });
  let rs = await rq.json();
  if (rs.data.error_code == 0) {
    setCookie("subscription", subscription, 365);
  }
};

const sendNotification = async () => {
  let model = {
    badge: $("input[name='badge']").val(),
    content: $("input[name='content']").val(),
    icon: $("input[name='icon']").val(),
    identify: [
      "daideptrai",
      "cuongdeptrai",
      "kiendeptrai",
      "duongdeptrai",
      "quandeptrai",
      "diepdeptrai",
    ],
    image: $("input[name='image']").val(),
    title: $("input[name='title']").val(),
    url: $("input[name='url']").val(),
    send_time: parseInt($("input[name='send_time']").val()),
    send_type: parseInt($("input[name='send_type']").val()),
    subscription: getCookie("subscription"),
  };
  let rq = await fetch(`${urlBase}/api/v1/send_notification`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(model),
  });
  let rs = await rq.json();
};

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
  navigator.serviceWorker.ready
    .then(function (registration) {
      return registration.pushManager.getSubscription();
    })
    .then(function (subscription) {
      if (!subscription) {
        subscribe();
      } else {
        let subs = getCookie("subscription");
        if (subs == "") {
          setSubscription(JSON.stringify(subscription));
        }
      }
    });
}
