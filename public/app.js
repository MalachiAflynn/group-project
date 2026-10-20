const form = document.getElementById("report-form");
const message = document.getElementById("form-message");
const list = document.getElementById("item-list");
const emptyMessage = document.getElementById("empty-message");

if (form) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault(); //stop the page from reloading
        const formInfo = new FormData(form);
        const data = Object.fromEntries(formInfo);
        let response;
        try{
            response = await fetch(form.dataset.endpoint, 
                {   
                    method: "POST", 
                    headers: { "Content-Type": "application/json" }, 
                    body: JSON.stringify(data)
                }
            );
        } catch {
            message.textContent = "Could not reach the server.";
            return;
        }
        const result = await response.json();
        if (!response.ok) {
            message.textContent = result.error;
            return;
        }
        message.textContent = ""; //no error means empty message
        if (emptyMessage) {
            emptyMessage.remove();
        }
        form.reset();
        list.prepend(createItem(result));
    });
}

function createItem(item) {
    const li = document.createElement("li");
    li.classList.add("item");
    const h3 = document.createElement("h3");
    h3.textContent = item.title;
    li.append(h3);
    const addLine = (text) => {
        const p = document.createElement("p");
        p.textContent = text;
        li.append(p);
    };
    addLine("Category: " + item.category);
    if (item.description) {
        addLine("Description: " + item.description);
    }
    addLine("Location: " + item.location);
    addLine("Date: " + new Date(item.date).toLocaleDateString("en-US", { timeZone: "UTC" }));
    addLine("Contact name: " + item.contactName);
    addLine("Contact email: " + item.contactEmail);
    return li;
}