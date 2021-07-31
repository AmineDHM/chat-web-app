const socket = io();

//DOM Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sideBarTemplate = document.querySelector("#sidebar-template").innerHTML;

//options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", ({ message, createdAt, username = "System" }) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    message,
    username,
    createdAt: moment(createdAt).format("HH:mm:ss"),
  });
  if (message) $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on(
  "location",
  ({ locationName, googleMapURL, createdAt, username = "System" }) => {
    const html = Mustache.render(locationMessageTemplate, {
      locationName,
      googleMapURL,
      username,
      createdAt: moment(createdAt).format("HH:mm:ss"),
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
  }
);

document.querySelector("#message-form").addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("message sent");
  });
});

$sendLocationButton.addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }
  $sendLocationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "location",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        console.log("Location is shared");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sideBarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});
