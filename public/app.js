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

        const newItem = createItem(result);
        list.prepend(newItem);
        htmx.process(newItem);
    });
}

function createItem(item) {
    const li = document.createElement("li");
    li.className = "relative flex min-w-0 flex-col gap-1 border border-tag-edge bg-tag p-4 wrap-anywhere [clip-path:polygon(1.25rem_0,100%_0,100%_100%,0_100%,0_1.25rem)]";
    const hole = document.createElement("span");
    hole.setAttribute("aria-hidden", "true");
    hole.className = "absolute top-5 left-4 size-3 rounded-full bg-page";
    li.append(hole);
    const h3 = document.createElement("h3");
    h3.className = "pl-5 text-xl font-bold";
    h3.textContent = item.title;
    li.append(h3);
    const addLine = (text, className = "") => {
        const p = document.createElement("p");
        p.className = className;
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
    addLine("Contact email: " + item.contactEmail, "mb-2");
    const button = document.createElement("button"); 
    button.type = "button";
    button.className = "mt-auto cursor-pointer self-start rounded border border-maroon px-3 py-1.5 font-medium text-maroon hover:bg-maroon hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon";
    button.textContent = "Delete";
    button.setAttribute("hx-delete", form.dataset.endpoint + "/" + item._id);
    button.setAttribute("hx-target", "closest li");
    button.setAttribute("hx-swap", "outerHTML");
    button.setAttribute("hx-confirm", "Delete this item?");
    li.append(button);
    return li;
}