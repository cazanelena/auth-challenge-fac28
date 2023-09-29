const {
  listConfessions,
  createConfession,
} = require("../model/confessions.js");
const { Layout } = require("../templates.js");
const { getSession } = require("../model/session.js");

function get(req, res) {
  // Get the session ID from the cookie
  const sid = req.signedCookies.sid;
  // Get the session from the DB
  const session = getSession(sid);
  // Get the logged in user's ID from the session
  const currentUser = session && session.user_id;

  //  Get the page owner from the URL params
  const pageOwner = Number(req.params.user_id);

  // If the logged in user is not the page owner send a 401 response
  if (currentUser !== pageOwner) {
    return res.status(401).send("<h1>You aren't allowed to see that</h1>");
  }
  const confessions = listConfessions(req.params.user_id);
  const title = "Your secrets";
  const content = /*html*/ `
    <div class="Cover">
      <h1>${title}</h1>
      <form method="POST" class="Stack" style="--gap: 0.5rem">
        <textarea name="content" aria-label="your confession" rows="4" cols="30" style="resize: vertical"></textarea>
        <button class="Button">Confess 🤫</button>
      </form>
      <ul class="Center Stack">
        ${confessions
          .map(
            (entry) => `
            <li>
              <h2>${entry.created_at}</h2>
              <p>${entry.content}</p>
            </li>
            `
          )
          .join("")}
      </ul>
    </div>
  `;
  const body = Layout({ title, content });
  res.send(body);
}

function post(req, res) {
  // Get the session ID from the cookie
  const sid = req.signedCookies.sid;
  // Get the session from the DB
  const session = getSession(sid);

  // Get the logged in user's ID from the session
  const currentUser = session && session.user_id;

  if (!req.body.content || !currentUser) {
    return res.status(401).send("<h1>Confession failed</h1>");
  }
  // Use the user ID to create the confession in the DB
  createConfession(req.body.content, currentUser);
  // Redirect back to the logged in user's confession page
  res.redirect(`/confessions/${currentUser}`);
}

module.exports = { get, post };
