import "./App.css";
import { useEffect, useState } from "react";
import { USER_DATA } from "./data";
import { v4 as uuidv4 } from "uuid";
import RecurrsiveComponent from "./RecurrsiveComponent";

const indexDbDataBase =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

const insertDataInIndexedDb = () => {
  //check for support
  if (!indexDbDataBase) {
    console.log("This browser doesn't support IndexedDB");
    return;
  }

  const request = indexDbDataBase.open("testDatabase", 1);

  request.onerror = function (event) {
    console.error("An error occurred with IndexedDB");
    console.error(event);
  };

  request.onupgradeneeded = function (event) {
    console.log(event);
    const db = request.result;

    if (!db.objectStoreNames.contains("userData")) {
      const objectStore = db.createObjectStore("userData", { keyPath: "id" });
      const objectStore1 = db.createObjectStore("sectorsData", {
        keyPath: "id",
      });
    }
  };

  request.onsuccess = function () {
    console.log("Database opened successfully");

    const db = request.result;

    var tx = db.transaction("user", "readwrite");
    var userData = tx.objectStore("user");

    USER_DATA.forEach((item) => userData.add(item));

    return tx.complete;
  };
};

const Basis = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [addUser, setAddUser] = useState(true);
  const [editUser, setEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [textInput, setTextInput] = useState("");
  const [occupation, setOccupation] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [formError, setFormError] = useState({});

  useEffect(() => {
    insertDataInIndexedDb();
    getAllData();
  }, []);

  const getAllData = () => {
    const dbPromise = indexDbDataBase.open("testDatabase", 2);
    dbPromise.onsuccess = () => {
      const db = dbPromise.result;

      var tx = db.transaction("userData", "readonly");
      var userData = tx.objectStore("userData");
      const users = userData.getAll();
      users.onsuccess = (query) => {
        setAllUsers(query.srcElement.result);
      };

      tx.oncomplete = function () {
        db.close();
      };
    };
  };

  const checkHandler = () => {
    setIsChecked(!isChecked);
  };

  const validateForm = () => {
    let err = {};

    if (textInput === "") {
      err.textInput = "Name required!";
    }

    if (occupation === "") {
      err.occupation = "Occupation required!";
    }
    if (isChecked === false) {
      err.isChecked = "Checked required!";
    }

    setFormError({ ...err });

    return Object.keys(err).length < 1;
  };

  const onSubmitHandler = (event) => {
    event.preventDefault();
    let isValid = validateForm();

    if (isValid) {
      const dbPromise = indexDbDataBase.open("testDatabase", 2);

      if (textInput && occupation && isChecked) {
        dbPromise.onsuccess = () => {
          const db = dbPromise.result;
          var tx = db.transaction("userData", "readwrite");
          var userData = tx.objectStore("userData");

          if (addUser) {
            const users = userData.put({
              id: uuidv4(),
              textInput,
              occupation,
              isChecked,
            });

            users.onsuccess = (query) => {
              tx.oncomplete = function () {
                db.close();
              };
              alert("User added!");
              setTextInput("");
              setOccupation("");
              setIsChecked(false);
              setAddUser(false);
              getAllData();
              event.preventDefault();
            };
          } else {
            const users = userData.put({
              id: selectedUser?.id,
              textInput,
              occupation,
              isChecked,
            });
            console.log("edit");

            users.onsuccess = (query) => {
              tx.oncomplete = function () {
                db.close();
              };
              window.confirm('Are you sure you wish to update the item?')
              setTextInput("");
              setOccupation("");
              setIsChecked(false);
              setEditUser(false);
              setAddUser(true);
              getAllData();
              setSelectedUser({});
              event.preventDefault();
            };
          }
        };
      } else {
        alert("Please enter all details");
      }
    } else {
      alert("In-Valid Form");
    }
  };

  return (
    <div className="row" >
      <div className="container ">
        <div className="card card_padding">
          <h3>{editUser ? "Update Data" : "Add Data"}</h3>
          <form onSubmit={onSubmitHandler}>
            Please enter your name and pick the Sectors you are currently
            involved in.
            <br />
            <br />
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                className="form-control"
                name="textInput"
                onChange={(e) => setTextInput(e.target.value)}
                value={textInput}
              />
              <span className="non-valid">{formError.textInput}</span>
            </div>
            <br></br>
            <div className="form-group">
              <label htmlFor="occupation" className="form-label">
                Sectors
              </label>
              <select
                className="form-select"
                name="occupation"
                onChange={(e) => setOccupation(e.target.value)}
                value={occupation}
              >
                <option value="">Select Item</option>
                <RecurrsiveComponent
                  data={USER_DATA}
                  parentIndex={0}
                  selectedId={occupation}
                />
              </select>
              <span className="non-valid">{formError.occupation}</span>
            </div>
            <br />
            <div className="form-group">
              <div>
                <div class="form-check form-check-inline">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    name="isChecked"
                    id="inlineCheckbox1"
                    checked={isChecked}
                    onChange={checkHandler}
                  />
                  <label class="form-check-label" for="inlineCheckbox1">
                    Agree to terms
                  </label>
                </div>
              </div>

              <span className="non-valid">{formError.isChecked}</span>
            </div>
            <br />
            <br />
            <div className="form-group">
              <button className="btn btn-primary" type="submit">
                {addUser ? "Submit" : "Update"}
              </button>
            </div>
          </form>
        </div>
        <br />
        <br />
      </div>
      <div className="container table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Name</th>
              <th>Sectors</th>
              <th>IsChecked</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allUsers?.length ?  allUsers?.map((user) => {
              return (
                <tr key={user?.id}>
                  <td>{user?.textInput}</td>
                  <td>{user?.occupation}</td>
                  <td>{user?.isChecked ? "Yes" : ""}</td>
                  <td>
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        setAddUser(false);
                        setEditUser(true);
                        setSelectedUser(user);
                        setTextInput(user?.textInput);
                        setOccupation(user?.occupation);
                        setIsChecked(true);
                      }}
                    >
                      Edit
                    </button>{" "}
                  </td>
                </tr>
              );
            }): <tr><td colSpan={4}>No data found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Basis;
