import React, { useState, useEffect, useContext } from "react";
import firebase from "../../FirebaseConfig.js";

import { AuthContext } from "../../context/authContext";

import { toast } from "../Toast/Toast";
import MyCard from "./MyCard/MyCard";
import OtherCard from "./OtherCard/OtherCard";

import {
	IonLoading,
	IonList,
	IonInput,
	IonItem,
	IonText,
	IonButton
} from "@ionic/react";

const Forum = () => {
	const [busy, setBusy] = useState(true);

	const { currentUser } = useContext(AuthContext);

	const Nodes = ["node1", "node2", "node3"];
	const [msg, setmsg] = useState("");
	const [messeges, setmesseges] = useState([]);
	const [currentNode, setCurrentNode] = useState(Nodes[0]);
	const [currentLocation, setCurrentLocation] = useState();

	const handleSubmit = () => {
		setBusy(true);

		if (msg.trim() === "") {
			toast("Cannot send an Empty msg", 4000);
		} else {
			writeMessageToDB(msg);
		}

		setmsg("");

		setBusy(false);
	};

	const getCurrentTimeDate = () => {
		let date = new Date().getDate(),
			month = new Date().getMonth() + 1,
			year = new Date().getFullYear(),
			hours = new Date().getHours(),
			min = new Date().getMinutes(),
			sec = new Date().getSeconds();

		return (
			date + "/" + month + "/" + year + " @" + hours + ":" + min + ":" + sec
		);
	};

	const writeMessageToDB = message => {
		if (currentNode.trim() !== "") {
			firebase
				.database()
				.ref(`messages/${currentNode}`)
				.push({
					text: message,
					name: "Current User",
					email: currentUser.email,
					time: getCurrentTimeDate()
				});
		} else {
			alert("assigning you a node");
		}
	};

	useEffect(() => {
		setBusy(true);
		if (currentNode.trim() !== "") {
			let messegeDB = firebase.database().ref(`messages/${currentNode}`);

			messegeDB.on("value", snapshot => {
				let newMesseges = [];
				snapshot.forEach(child => {
					let messege = child.val();

					newMesseges.push({
						id: child.key,
						text: messege.text,
						name: messege.name,
						email: messege.email,
						time: messege.time
					});
				});

				setmesseges(newMesseges);
				setBusy(false);
			});
		} else {
			alert("assigning you a node");
		}
	}, [currentNode]);

	function getRndInteger() {
		let max = Nodes.length,
			min = 0;

		return Math.floor(Math.random() * (max - min)) + min;
	}

	const changeNode = () => {
		let temp = Nodes[getRndInteger()];
		setCurrentNode(temp);
	};

	const returnMsgComponent = (text, name, email, time) => {
		if (email === currentUser.email) {
			return <MyCard name={name} text={text} time={time} />;
		} else {
			return <OtherCard name={name} text={text} time={time} />;
		}
	};

	return (
		<>
			<IonLoading message="Please wait" duration={0} isOpen={busy}></IonLoading>

			<IonList>
				{messeges.map((message, id) => (
					<IonItem key={id}>
						{returnMsgComponent(
							message.text,
							message.name,
							message.email,
							message.time
						)}
					</IonItem>
				))}
			</IonList>

			<IonItem>
				<IonInput
					value={msg}
					onIonChange={event => setmsg(event.target.value)}
					type="text"
					placeholder="Type a messege"
				/>
				<IonButton onClick={handleSubmit}>submit</IonButton>
			</IonItem>
			<IonItem>
				<IonText> current Node: {currentNode}</IonText>
			</IonItem>

			{/* <IonButton onClick={changeNode}>change Node</IonButton> */}
		</>
	);
};

export default Forum;