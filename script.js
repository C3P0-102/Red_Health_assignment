async function dropdownmenu(){
    try {
        const response = await fetch('./users.json');
        const data = await response.json();
        const dropdown = document.getElementById('user-select');

        data.users.forEach(users => {
            const option = document.createElement('option');
            option.value = users.name;
            option.textContent = `${users.name} (${users.companyName})`;
            dropdown.appendChild(option);
        
        });
    } catch (error) {
        console.error('Error loading the countries:', error);
    }

}

window.onload = dropdownmenu();

let comments = [];
let sortOrder = "newest";

fetch("comments.json")
  .then(res => res.json())
  .then(data => {
    comments = data.map(c => ({
      ...c,
      timestamp: c.timestamp ? new Date(c.timestamp): new Date()    }));
    renderComments();
  });

function renderComments() {
  const container = document.getElementById("comments-list");
  const count = document.getElementById("comment-count");

  const sorted = [...comments].sort((a, b) =>
    sortOrder === "newest" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
  );

  count.textContent = sorted.length;

  fetch("users.json")
    .then(res => res.json())
    .then(usersData => {
      const userMap = {};
      usersData.users.forEach(u => {
        userMap[u.email] = u.companyName;
      });
      container.innerHTML = sorted.map(c => {
        const company = userMap[c.email] || "Unknown";
        return `
          <div class="comment-card">
            <span class="top-span">
              <div class="avatar">${getInitials(c.name)}</div>
              <span class="com-arrange">
                <h3 class="comment-name">${c.name}</h3>
                <p class="comment-email">${c.email}</p>
              </span>
              <h3 class="comment-company">${company}</h3>
            </span>
            <p class="comment-body">${c.body}</p>
          </div>
        `;
      }).join("");
    });
}

function getInitials(name) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase();
}

function addComment() {
  const userSelect = document.getElementById("user-select");
  const messageInput = document.querySelector(".comment-input");

  const selectedUser = userSelect.value;
  const message = messageInput.value.trim();

  if (!selectedUser || !message) {
    alert("Please select a user and enter a comment.");
    return;
  }

  const selectedOption = userSelect.options[userSelect.selectedIndex].text;
  const company = selectedOption.match(/\((.*?)\)/)[1]; 
  const email = selectedUser.toLowerCase().replace(" ", ".") + "@example.com";

  fetch("users.json")
    .then(res => res.json())
    .then(data => {
      const userObj = data.users.find(u => u.name === selectedUser);
      const company = userObj ? userObj.companyName : "Unknown";
      const email = userObj ? userObj.email : selectedUser.toLowerCase().replace(" ", ".") + "@example.com";

      const newComment = {
        id: Date.now(),
        name: selectedUser,
        email,
        company,
        body:message,
        timestamp: new Date()
      };

      comments.push(newComment);

      messageInput.value = "";
      userSelect.selectedIndex = 0;

      renderComments();
    });
}

document.getElementById("newest-btn").addEventListener("click", () => {
  sortOrder = "newest";
  renderComments();
});

document.getElementById("oldest-btn").addEventListener("click", () => {
  sortOrder = "oldest";
  renderComments();
});
