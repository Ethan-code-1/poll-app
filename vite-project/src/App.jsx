import { useState, useEffect } from "react";
import "./App.css";
import { db } from "../firebase";
import { addDoc, collection, doc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { async } from "@firebase/util";

function App() {
    const [answer, setAnswer] = useState("");
    const [responses, setResponses] = useState([]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        const docRef = await addDoc(collection(db, "poll-responses"), {
            response: answer,
            upvotes: 0, 
        });
        //console.log("created doc with id: ", docRef.id);
        fetchResponses();
    };

    const fetchResponses = async () => {
      getDocs(collection(db, "poll-responses"))
      .then((Snapshot) => {
          const fetchedResponses = [];
          Snapshot.forEach((doc) => {
              fetchedResponses.push({ id: doc.id, response: doc.data().response, upvotes : doc.data().upvotes });
          });

          //Sorting functionality from online
          fetchedResponses.sort((a, b) => b.upvotes - a.upvotes);
          setResponses(fetchedResponses);
      })
      .catch((error) => {
          console.error("Error fetching documents: ", error);
      });
  };

  useEffect(() => {
    fetchResponses();  
}, []);

const handleUpvote = async (id, currentUpvotes) => {
    const docRef = doc(db, 'poll-responses', id);

    await updateDoc(docRef, {
      upvotes: currentUpvotes + 1, 
    })


  fetchResponses(); 
};

const handleDelete = async (id) => {
  await deleteDoc(doc(db, 'poll-responses', id));

  fetchResponses(); 
}
    

    return (
        <>
            <h1>What is the best place to travel to?</h1>
            <form onSubmit={handleSubmit}>
                <label>Answer:</label>
                <input type="text" onChange={(e) => setAnswer(e.target.value)}></input>
                <button type="submit">Submit</button>
            </form>
            <h2>Responses</h2>
            <table>
                <thead>
                    <tr>
                        <th>Response</th>
                        <th>Upvotes</th>
                        <th>Upvote?</th>
                        <th>Delete?</th>
                    </tr>
                </thead>
                <tbody>
                    {responses.map((response) => (
                        <tr key={response.id}>
                            <td>{response.response}</td>
                            <td>{response.upvotes}</td>
                            <td>
                              <button onClick={() => handleUpvote(response.id, response.upvotes)}>Upvote</button>
                            </td>
                            <td>
                              <button onClick={() => handleDelete(response.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

export default App;