const formAccount = document.getElementById("accountForm");
const formName = document.getElementById("accountName");
const formMoney = document.getElementById("accountMoney");
const accountList = document.getElementById("accountList");
const select = document.getElementById("addOrRemove");
const label = document.getElementById("moneyLabel");

const FORM_MODES = {
    CREATE: 'create',
    EDIT: 'edit'
  }
  let formMode = FORM_MODES.CREATE;
  let editPostItem = null;

  let accounts = [];

  const postTemplate = (account) => `
  <li>
    <h3>Kontots ägare: ${account.accountName}</h3>
    <p>Pengar på kontot: ${account.accountMoney} kr</p>
    <p>Kontonummer: ${account._id}
    <br>
    <button data-function="edit" data-postid="${account._id}">Insättning/Uttag</button>
    <button data-function="delete" data-postid="${account._id}">Radera konto</button>
  </li>
`;

const deletePost = async (e) => { 
    await fetch(`/api/accounts/${e.target.dataset.postid}`, {
      method: 'DELETE'
    });
    formAccount.reset();
    formName.disabled = false;
    addOrRemove.hidden = true;
    label.hidden = true;
    readPosts();
  } 

  const editPost = async (e) => { 
    formMode = FORM_MODES.EDIT;
    editPostItem = accounts.find(({ _id }) => _id === e.target.dataset.postid);
    formName.value = editPostItem.accountName;
    formMoney.value = editPostItem.accountMoney;
    formName.disabled = true;
    addOrRemove.hidden = false;
    label.hidden = false;
  }

  const addButtonListeners = () => { 
    const deleteBtns = document.querySelectorAll('[data-function="delete"]');
    deleteBtns.forEach(btn => btn.addEventListener('click', deletePost));
  
    const editBtns = document.querySelectorAll('[data-function="edit"]');
    editBtns.forEach(btn => btn.addEventListener('click', editPost));
  }

  const readPosts = async () => { 
    const res = await fetch('/api/accounts');
    accounts = await res.json();
  
    accountList.innerHTML = accounts.map(postTemplate).join('');
    addButtonListeners();
  }

  formAccount.addEventListener('reset', async (e) => {
    formMode = FORM_MODES.CREATE;
    editPostItem = null;
    addOrRemove.hidden = true;
    formName.disabled = false;
    label.hidden = true;
  });

  formAccount.addEventListener('submit', async (e) => {
    e.preventDefault();
    const useUrl = formMode === FORM_MODES.CREATE ? '/api/accounts' : `/api/accounts/${editPostItem._id}`;
    const method = formMode === FORM_MODES.CREATE ? 'POST' : 'PUT';
    if (editPostItem !== null){
      if(formMoney.value > editPostItem.accountMoney && select.value === "remove"){
        alert('Går ej att genomföra! Du försöker ta ut mer pengar än det finns på kontot.')
        return;
      } else if(formMoney.value < 0){
        alert('Går ej att ange negativ summa.')
        return;
      }
    }
      await fetch(useUrl, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        accountName: formName.value,
        accountMoney: formMoney.value,
        addOrRemove: select.value,
      })
    });
    
    formAccount.reset();
    formName.disabled = false;
    addOrRemove.hidden = true;
    label.hidden = true;
    readPosts();
  });
  
  readPosts();
  
