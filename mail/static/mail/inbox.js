document.addEventListener('DOMContentLoaded', function() {
  console.log("loaded")
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', submit_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';
  
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  console.log(mailbox)
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#view-email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').innerHTML = '';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);
    // ... do something else with emails ...
    emails.forEach(mail => {
      //new div
      const email = document.createElement('div');
      // assign json value to variable 
      const sender = mail.sender;
      const subject = mail.subject;
      const time = mail.timestamp;
      const id = mail.id
      email.className = 'card';
      // new div innerHTML
      email.innerHTML = mail['read'] ? `
      <button type="button" class="list-group-item list-group-item-action list-group-item-secondary">
        <div class="card-body">
        <div class="row g-0">
        <div class="col-4 col-md-4"><b class="card-title">${sender}</b></div>
        <div class="col-sm-6 col-md-4"><p class="card-text">${subject}</p></div>
        <div class="col-sm-4 col-md-4" style="text-align: right"><small class="text-muted">${time}</small></div>
        </div>
      </button>
      ` : `
      <button type="button" class="list-group-item list-group-item-action">
        <div class="card-body">
        <div class="row g-0">
        <div class="col-4 col-md-4"><b class="card-title">${sender}</b></div>
        <div class="col-sm-6 col-md-4"><p class="card-text">${subject}</p></div>
        <div class="col-sm-4 col-md-4" style="text-align: right"><small class="text-muted">${time}</small></div>
        </div>
      </button>
      `;
      
      //add eventlistener to each email div
      email.addEventListener('click', function() {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ read : true })
        })
        .then(response => view_mail(id));
      });
      document.querySelector('#emails-view').append(email);
    });
  });
}

function submit_email(event) {
  event.preventDefault()
  fetch('/emails' , {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => load_mailbox('sent'));
}


function view_mail(id) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').setAttribute("class", "ps-3");
  
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);
    const user = document.querySelector("#user").innerHTML;
    // create new div to show email body
    const div = document.createElement('div');
    div.className = 'container-fluid mt-3';

    // new div innerHTML
    div.innerHTML = `
      <div class="card-body">
      <div class="row g-0">
      <div class="col-2 col-md-2"><b>From : </b></div>
      <div class="col-sm-6 col-md-6">${email['sender']}</div>
      <div class="col-sm-6 col-md-4" style="text-align: right"><small class="text-muted">${email['timestamp']}</small></div>
      </div>
      <hr>
      <div class="row g-0 text-start">
      <div class="col-2 col-md-2"><b>To : </b></div>
      <div class="col-sm-6 col-md-10">${email['recipients']}</div>
      </div>
      <hr>
      <div class="row g-0 text-start">
      <div class="col-2 col-md-2"><b>Subject: </b></div>
      <div class="col-sm-6 col-md-10">${email['subject']}</div>
      </div>
      <hr>
      <div class="row g-0 text-start">
      <div class="col-2 col-md-2"><b>Body: </b></div>
      <div class="col-sm-6 col-md-10">${email['body']}</div>
      </div>
      </div>`
    
    //create new div to show email
    const newdiv = document.createElement('div');
    newdiv.id = "email";
    newdiv.className = "card border rounded-5 p-3";
    document.querySelector('#view-email').append(newdiv);

    // create button group
    const bg = document.createElement('div');
    bg.id = "btn_group";
    bg.className = "rounded-pill btn-group mb-3";
    document.querySelector('#email').append(bg);

    //check if mail is in sent mailbox
    if (email['sender'] != user) {
      //add to archive button
    const a = document.createElement('button');
    a.type = "button";
    a.className = "btn btn-sm btn-outline-secondary";
    a.id = "archive";
    a.innerHTML = email['archived'] ? "Remove from archive." : "Add to archive.";
    document.querySelector('#btn_group').append(a);
    document.querySelector("#archive").addEventListener('click', function() {
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ archived : !email['archived'] })
      })
      .then(response => load_mailbox('inbox'));
    });
    }
    
    //mark as read button
    const b = document.createElement('button');
    b.type = "button";
    b.className = "btn btn-sm btn-outline-secondary";
    b.id = "read";
    b.innerHTML = email['read'] ? "Mark as unread." : "Mark as read.";
    document.querySelector('#btn_group').append(b);
    document.querySelector("#read").addEventListener('click', function() {
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ read : !email['read'] })
      })
      document.querySelector('#view-email').innerHTML = "";
      view_mail(id);
    })
    
    // add email body to new div
    document.querySelector('#email').append(div);

    //create reply button
    const r = document.createElement('button');
    r.type = "button";
    r.className = "btn btn-sm btn-outline-dark";
    r.id = "reply";
    r.innerHTML = "Reply";
    document.querySelector('#btn_group').append(r);
    document.querySelector("#reply").addEventListener('click', function() {
      //load compose form
      compose_email();
      //pre-fill compose form
      let re_subject = email['subject'];
      console.log(re_subject);
      if (re_subject.split(" ", 1)[0] != "Re:") {
        re_subject = "Re: " + re_subject;
      }
      console.log(re_subject);
      let re_body = `On ${email['timestamp']}, ${email['sender']} wrote: "${email['body']}"`;
      console.log(re_body);
      document.querySelector('#compose-recipients').value = email['sender'];
      document.querySelector('#compose-subject').value = re_subject;
      document.querySelector('#compose-body').value = re_body;
    })
  });
}
