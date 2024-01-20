// Import Firebase SDK modules using ES modules syntax
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
    getFirestore,
    query,
    collection,
    where,
    setDoc,
    getDocs,
    updateDoc,
    addDoc,
    doc,
    getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Firebase configuration object containing API key and other credentials
var firebaseConfig = {
    apiKey: "AIzaSyCvtfSR68KMonjX-kvjGdoXXgSyRqqoLmc",
    authDomain: "fitconnect-37835.firebaseapp.com",
    projectId: "fitconnect-37835",
    storageBucket: "fitconnect-37835.appspot.com",
    messagingSenderId: "331852927323",
    appId: "1:331852927323:web:eed2141ac7729a33c2ca7e"
};

// Initialize Firebase app with the provided configuration
const app = initializeApp(firebaseConfig);

// When document is loaded
$(document).ready(function () {

    // check if user logined, if logined show the logout <li>
    if (sessionStorage.getItem("id")) {
        $('#check1').hide();
        $('#check2').show();
    }
    else {
        $('#check2').hide();
        $('#check1').show();
    }

    // if user clicks "logout", do the logout job done.
    $('#check2').click(function () {
        alert("Logged out");
        sessionStorage.clear();
        location.reload();
        $('#check2').hide();
        $('#check1').show();
    });

    if (window.location.href.endsWith("workout.html")) {
        // If user is in workout page

        // Hide useless elements at the beginning
        $(".detailRecordpart").hide();
        $(".showandrecord").hide();
        $(".inputs").hide();
        $(".showRecord").hide();

        // Set default values.
        var nowexercise = "Fitness";
        var noworktitle = "Deadlift";

        // flag for checking if user clicked fitness & detailed record
        var detailRecordcheck = 0;

        // For various types of exercises, when clicked
        $('.selectExercise li').click(function () {

            // Get the current clicked list text
            var targetElement = $(this);
            nowexercise = targetElement.text();

            // If it is fitness, show detailRecord (used for checking if users clickes detailed record option)
            if (targetElement.text() === "Fitness") {
                $(".detailRecord").show();
                $(".detailRecordpart").hide();
            }
            else {
                // If not, hide detail parts
                $(".detailRecordpart").hide();
                $(".detailRecord").hide();
            }
            // Everytime list element is clicked, set flag to 0 (false)
            detailRecordcheck = 0;
        })

        // If detailExercise is clicked ('+' symbol)
        $('#detailExercise').click(function () {
            // Set flag to 1 (true) and show the details
            detailRecordcheck = 1;
            $(".detailRecordpart").show();
        })

        // If exercise in fitness (Deadlift, Benchpress etc.) is clicked
        $('.worktitle').click(function () {
            // Get current exercise text, and set now working title
            var targetElement = $(this);
            noworktitle = targetElement.text();
            
            // Find sibling element for recording kgs and reps
            targetElement.siblings('.inputs').find('input').val("");
            
            // Hide useless elements
            $(".inputs").hide();
            $(".showandrecord").hide();

            // Show the corresponding exercise explanation and input fields
            targetElement.siblings('.showandrecord').show();
            targetElement.siblings('.inputs').show();
        })

        // Get 'workout-record' collection from Firestore DB
        const newdb = getFirestore(app);
        const workoutCollection = collection(newdb, 'workout-record');

        // Get current date and set default date to current
        var today = new Date().getDate();
        var clickeddate = today;

        // For clicked date, set border for it to be recognizable for user
        $(`.${clickeddate}`).css({ "border": "3px solid red" });

        // For calendar list, (1, 2, ..., 31)
        $('.calendar li').click(function () {
            // Set before dates border as none
            $(`.${clickeddate}`).css({ "border": "none" });
            
            // Get user clicked date
            clickeddate = $(this).text();
            if (clickeddate > today) {
                // If it is future, set date to today and alert user
                alert("The future records are currently inaccessible.");
                clickeddate = today;
            }

            // Remove showing Records from before dates calendar
            $('.showRecord').remove();

            // Set user clicked date's border
            $(`.${clickeddate}`).css({ "border": "3px solid red" });
            
            // Get current clicked date's workout record
            updateContent(clickeddate);
        })

        // While setting workout time, when user enters minute info
        $('#min').on('input', function(){
            var min = parseInt($(this).val());
            // If it is invalid, set it to 59 (maximum)
            if(min >= 60){
                $(this).val("59");
            }
        });

        // While setting workout time, when user enters minute info
        $('#sec').on('input', function(){
            var sec = parseInt($(this).val());
            // If it is invalid, set it to 59 (maximum)
            if(sec >= 60){
                $(this).val("59");
            }
        });

        // Variable for setting the calendar (workout records) owner
        var userId = "";
        // Variable for removing exercise adding button (if user is not the owner)
        var rmflag = 0;

        // Get the info from seesion storage, if it redirected from user page
        if (sessionStorage.getItem("require-record")) {
            // if it was request from user page, set user id
            userId = sessionStorage.getItem("require-record");

            // As id != login user's id, login user can't edit record
            rmflag = 1;
            
            // Remove the "require-record" data, as it was used
            sessionStorage.removeItem("require-record");

            // Hide exercise selecting elements
            $('#exercise').hide();
        }

        // If user is logged in
        if (sessionStorage.getItem("id")) {
            
            // If userId was already setted from user page
            if (userId != "") {
                // If setted userId is not current user's id
                if (userId != sessionStorage.getItem("id")) {
                    $('#exercise').hide();
                }
                else {
                    // If setted userId equals current user's id
                    $('#exercise').show();
                    rmflag = 0;
                }
            }
            else { // If userId was not setted from user page
                userId = sessionStorage.getItem("id");
            }
        }

        // If logined user is not the owner of workout record
        if (rmflag) {
            // Remove exercising selecting elements & set calendar to be in middle
            $('#exercise').remove();
            $('.by-media').css({ 'display': 'block' });
            rmflag = 0;
        }

        // If user not logined and not from user page, alert user and redirects
        if (userId === "") {
            alert("To view exercise records, you need to be logged in \nor select the user from user page.")
            window.location.href = "./index.html";
            // 정보없는 친구는 메인 페이지로 리다이렉션
        }

        // Get the workout records table from DB
        const userDocRef = doc(workoutCollection, userId);
        // Get the records info by default (info of current date)
        updateContent(clickeddate);

        // fuction to get the information from DB, depends on clickeddate element 
        function updateContent(clickeddate) {
            getDoc(userDocRef).then((docSnapshot) => {
                if (docSnapshot.exists()) { // If userId document exists

                    // Get map info, if not exist set it empty map
                    const detailsMap = docSnapshot.data().details || {};

                    // Get the array of map's key (recorded date information)
                    const keys = Object.keys(detailsMap);
                    for (var i = 0; i < keys.length; i++) {
                        var recordeddate = parseInt(keys[i]);
                        // For each recorded date, append a img to let user know which date has information
                        $(`.${recordeddate}`).append('<img id="fire" src="../src/fire.png" alt="">');
                    }

                    // Get clicked date's workout record, if exists
                    const clickeddateValue = detailsMap[clickeddate];
                    // Variable for counting the total time spent on clicked date's workouts
                    var totalCount = 0;

                    for (var i = 0; i < clickeddateValue.length; i++) {
                        totalCount += clickeddateValue[i].hour * 60;
                        totalCount += clickeddateValue[i].min;
                    }

                    // If clicked date's workout record exists
                    if (clickeddateValue) {
                        // Create a new workout record
                        const showRecord = $('<div class="showRecord"></div>');
                        
                        // Set date div using clicked date
                        const dateDiv = $('<div class="date"></div>');
                        dateDiv.append(`<div class="showDate">12.${clickeddate}.</div>`);
                        dateDiv.append('<span class="emphasis">Exercise</span>');

                        // Set inline div using clicked date value (Array of Recorded exercise) and total time spent
                        const inlineDiv = $('<div class="inline"></div>');
                        inlineDiv.append(`<div>💪 <div class="workCount">${clickeddateValue.length} Exercises</div></div>`);
                        inlineDiv.append(`<div>⏱️<div class="timeCount">${totalCount} minutes</div></div>`);

                        // append date & inline div in showRecord div
                        showRecord.append(dateDiv);
                        showRecord.append(inlineDiv);

                        // For each exercise in record
                        for (var i = 0; i < clickeddateValue.length; i++) {
                            // Make new detailedRecord div, used for showing the info stored inside
                            const detailedRecordDiv = $('<div class="detailedRecord"></div>');

                            // Get exercise's name and append the corresponding image
                            var exname = clickeddateValue[i].exercise
                            var exnamenospace = exname.replace(/\s/g, '')
                            detailedRecordDiv.append(`<img src="../src/${exnamenospace}.gif" alt="">`);

                            // Make new column div and append exercise's name
                            const columnDiv = $('<div class="column"></div>');
                            columnDiv.append(`<div class="workoutname">${exname}</div>`);

                            // If sets info exists
                            if (clickeddateValue[i].sets) {
                                // Make a setsDiv and append the set 1~4 information stored
                                const setsDiv = $('<div class="set-info"></div>');
                                setsDiv.append(`<div class="set1">${clickeddateValue[i].sets[0].kg}kg X ${clickeddateValue[i].sets[0].rep} reps</div>`);
                                setsDiv.append(`<div class="set1">${clickeddateValue[i].sets[1].kg}kg X ${clickeddateValue[i].sets[1].rep} reps</div>`);
                                setsDiv.append(`<div class="set1">${clickeddateValue[i].sets[2].kg}kg X ${clickeddateValue[i].sets[2].rep} reps</div>`);
                                setsDiv.append(`<div class="set1">${clickeddateValue[i].sets[3].kg}kg X ${clickeddateValue[i].sets[3].rep} reps</div>`);
                                columnDiv.append(setsDiv);
                            }

                            // Assembling the made divs.
                            detailedRecordDiv.append(columnDiv);
                            showRecord.append(detailedRecordDiv);
                        }

                        // If logined user is owner of record
                        if (userId === sessionStorage.getItem('id')) {
                            // Add erase button, used for erasing clicked date's record
                            const eraseRecordButton = $('<Center><button id="eraseRecord">Erase Exercise Record</button></Center>');

                            // When added erase button is clicked
                            eraseRecordButton.click(function () {
                                // Make confirmation, so user can confirm erasing record
                                const confirmation = confirm('Are you sure you want to erase the exercise record?');

                                if (confirmation) {
                                    // User clicked "Yes"
                                    // Add the logic to erase the exercise record here
                                    const updatedDetailsMap = { ...detailsMap }; // Create a shallow copy
                                    delete updatedDetailsMap[clickeddate]; // Remove the clickeddate entry

                                    // Update Firestore document with the new detailsMap
                                    updateDoc(userDocRef, { details: updatedDetailsMap }).then(() => {
                                        alert('Exercise record erased!');
                                        $('#fire').remove();
                                        location.reload();
                                    }).catch((error) => {
                                        console.error('Error updating document:', error);
                                    });
                                }
                            });

                            // append erase button in showrecord
                            showRecord.append(eraseRecordButton);
                        }

                        // As a result, append it to the body of html
                        $('body').append(showRecord);
                    } else {
                        // If clicked date's value does not exists
                        console.log(`No data for ${clickeddate} in details map!`);
                    }
                } else {
                    // If document errored
                    console.log("No such document!");
                }
            }).catch((error) => {
                console.error("Error getting document:", error);
            });
        }

        // if user clicks add exercise button, try editing the DB
        $('#addExerciseButton').click(function () {
            
            // Get workout time data and parse it into type 'int'
            var hour = parseInt($('#hour').val(), 10);  
            var min = parseInt($('#min').val(), 10);
            var sec = parseInt($('#sec').val(), 10);
            // If data is NaN, set it to 0
            hour = isNaN(hour) ? 0 : hour;
            min = isNaN(min) ? 0 : min;
            sec = isNaN(sec) ? 0 : sec;

            // If, even one data isn't entered, alert user to enter data
            if (hour === 0 && min === 0 && sec === 0) {
                alert('Please enter a valid hour');
            }
            else {
                // If time data is valid
                if (detailRecordcheck) { // If user checked detailed record
                    
                    // Get the current exercise data's text without space
                    var noworktitleWithoutSpaces = noworktitle.replace(/\s/g, '');
                    
                    // Get the user entered sets kg and rep data
                    var setValues = [];
                    for (var i = 1; i <= 4; i++) {
                        var setKg = parseInt($(`.${noworktitleWithoutSpaces.trim()} #kg${i}`).val(), 10);
                        var setRep = parseInt($(`.${noworktitleWithoutSpaces.trim()} #rep${i}`).val(), 10);

                        setKg = isNaN(setKg) ? 0 : setKg;
                        setRep = isNaN(setRep) ? 0 : setRep;

                        // store each set's info in array
                        setValues.push({ kg: setKg, rep: setRep });
                    }

                    // If every kg in set is 0, user input is invalid
                    if (setValues.every(set => set.kg === 0)) {
                        alert("Please input the sets and repetitions for the performed exercise.");
                    }
                    else {
                        // Get userId by using "id" and session storage, as logined user is owner of record
                        var userId = sessionStorage.getItem("id");
                        // Get the current workout collection
                        const docRef = doc(workoutCollection, userId);

                        getDoc(docRef).then((doc) => {
                            // Get the map from the DB, if not exist, set as empty map
                            const detailsMap = doc.data().details || {};
                            // Get the clickeddate's info, if not exist, set as empty array
                            const datelist = detailsMap[clickeddate] || [];

                            // In the array, find the object in array that if it already contains the chosen exercise's record
                            const existingExerciseIndex = datelist.findIndex(entry => entry.exercise === noworktitle);

                            if (existingExerciseIndex !== -1) {
                                // If an exercise with the same name exists, reset hour, min, sec
                                datelist[existingExerciseIndex].hour = hour;
                                datelist[existingExerciseIndex].min = min;
                                datelist[existingExerciseIndex].sec = sec;
                                datelist[existingExerciseIndex].sets = setValues;
                            }
                            else {
                                // If not exist, set the object and push it to array
                                const newDetailsObject = {
                                    exercise: noworktitle,
                                    hour: hour,
                                    min: min,
                                    sec: sec,
                                    sets: setValues
                                };
                                datelist.push(newDetailsObject);
                            }

                            // Update the detailsMap
                            detailsMap[clickeddate] = datelist;
                            
                            // Update the DB
                            updateDoc(docRef, { details: detailsMap }).then(() => {
                                // Append image to clicked calendar data
                                $(`.${clickeddate}`).append('<img id="fire" src="../src/fire.png" alt="">');
                                
                                // Reset the value of the entered time info
                                $('#hour').val("");
                                $('#min').val("");
                                $('#sec').val("");

                                // Reload the page
                                location.reload();
                            }).catch((error) => {
                                console.error('Error updating document:', error);
                            });
                        });
                    }
                }
                else {                    // If user didn't select detailed exercise
 
                    // Get user's id and DB
                    var userId = sessionStorage.getItem("id");
                    const docRef = doc(workoutCollection, userId);

                    getDoc(docRef).then((doc) => {
                        // From DB, get the data needed
                        const detailsMap = doc.data().details || {};
                        const datelist = detailsMap[clickeddate] || [];

                        // Find the index, check if it exists
                        const existingExerciseIndex = datelist.findIndex(entry => entry.exercise === nowexercise);

                        if (existingExerciseIndex !== -1) {
                            // If an exercise with the same name exists, update hour, min, sec
                            datelist[existingExerciseIndex].hour += hour;
                            datelist[existingExerciseIndex].min += min;
                            datelist[existingExerciseIndex].sec += sec;
                        } else {
                            // If no exercise with the same name exists, add a new entry
                            const newDetailsObject = {
                                exercise: nowexercise,
                                hour: hour,
                                min: min,
                                sec: sec,
                            };
                            datelist.push(newDetailsObject);
                        } // Use push instead of append
                        detailsMap[clickeddate] = datelist;

                        // Update Firestore document
                        updateDoc(docRef, { details: detailsMap }).then(() => {
                            console.log('Document successfully updated!');
                            location.reload();
                        }).catch((error) => {
                            console.error('Error updating document:', error);
                        });
                    }).then(() => {

                        // Reset the value of the entered time info
                        $('#hour').val("");
                        $('#min').val("");
                        $('#sec').val("");
                    
                    }).catch((error) => {
                        console.error('Error getting document:', error);
                    });
                }
            }
        });

    }
    else if (window.location.href.endsWith("login.html")) {
        // Followings are functions for login page

        // When login button is clicked
        $('.login .button').click(function () {

            // Get the user input val of id and password
            var id = $('#loginid').val();
            var password = $('#loginpass').val();

            // Get a reference to the Firestore database from the initialized Firebase app
            const newdb = getFirestore(app);
            // Specify the collection to query (assuming it's a collection named 'user-info')
            const loginCollection = collection(newdb, 'user-info');
            // Create a query with conditions for 'id' and 'password'
            const queryRef = query(loginCollection, where("id", "==", id), where("password", "==", password));

            getDocs(queryRef).then((querySnapshot) => {
                // IF id and password matches
                if (querySnapshot.size > 0) {
                    // Set sessionStorage, to inform the website that user has been logined
                    sessionStorage.setItem("id", id);
                    // Redirect to main page (index.html)
                    window.location.href = "./index.html";
                } else {
                    // IF it doesn't matchs alert it
                    alert("Invalid ID or password");
                    $('input').each(function () {
                        // Set the text of each input element to an empty string, except for submit type
                        if ($(this).attr('type') !== 'submit') {
                            $(this).val('');
                        }
                    });
                }
            }).catch((error) => {
                console.error("Error getting documents: ", error);
            });
        })

        // When signup button is clicked
        $('.signup .button').click(function () {

            // Get the inputs from user, name,id
            var name = $('#signupname').val();
            var id = $('#signupid').val();

            // If id is too long
            if (id.length > 10) {
                alert("ID length is less than 10 characters");
                $('input').each(function () {
                    // Set the text of each input element to an empty string except submit type
                    if ($(this).attr('type') !== 'submit') {
                        $(this).val('');
                    }
                });
            }
            else { // If id length is valid get the password input from user
                var password = $('#signuppass').val();
                const newdb = getFirestore(app);

                const loginCollection = collection(newdb, 'user-info');
                const queryRef = query(loginCollection, where("id", "==", id));

                getDocs(queryRef).then((querySnapshot) => {
                    if (querySnapshot.size > 0) {
                        // If same id alreay exists in the 'user-info' collection
                        alert("This ID already exists");
                        $('input').each(function () {
                            // 각 input 요소의 텍스트를 빈 문자열로 설정
                            if ($(this).attr('type') !== 'submit') {
                                $(this).val('');
                            }
                        });
                    } else {
                        // If id is valid, not duplicated then make a document in 'workout-record' collection, with user's id
                        const userDocRef = doc(newdb, 'workout-record', id);
                        setDoc(userDocRef, {
                            // Set the default workout record, which is no elements in the map
                            details: {}
                        });

                        // Set the sessionStorage to inform website that user has been logined
                        sessionStorage.setItem("id", id);

                        // Add user information in the 'user-info' collection
                        addDoc(loginCollection, {
                            name: name,
                            id: id,
                            password: password,
                            greet: "Let's workout!",
                        }).then(() => {
                            // If 'user-info' updated, move to main page (index.html)
                            window.location.href = "./index.html";
                        })
                    }
                }).catch((error) => {
                    console.error("Error getting documents: ", error);
                });
            }
        })
    }
    else if (window.location.href.endsWith("community.html")) {
        // If current page is community page
        
        // Variable for storing posted user's id, later used for storing comments in DB
        var docidnow;
        
        // Function for adding new row in table, information about DB saved post datas.
        function addTableRow(docid, userid, title, comcontents, contents, date) {
            // create a new row, using the formal parameters passed by value
            const newRow = `
                <tr>
                    <td>
                        <div class="post-box">
                            <div class="name">${userid}</div>
                            <div class="title">${title}</div>
                            <div class="commentcount">${comcontents.length}</div>
                        </div>
                    </td>
                </tr>
            `;

            // Add new row in the table
            $('#posttable').append(newRow);

            // For each newly added row, add a click responsive function
            $('#posttable tr:last').click(function () {
                // Set the docidnow as newly added row's docid, later used for add Comments in DB
                docidnow = docid;
                // Set the "getpage" div, which is used for displaying the title, posted user's id, date and contents
                const getpageContent = `
                <div class="getpage">
                    <div class="get_title">${title}</div>
                    <div class="pageinfo">
                        ${userid} :  ${date} 
                    </div>
                    <div class="get_content">${contents}</div>
                    Comments
                </div>
            `;
                // replace the existing getpage
                $('.getpage').replaceWith(getpageContent);
                // create a html string to add in "getpage" 
                if (comcontents && comcontents.length > 0) {
                    // when comcontents exist and not empty (comments stored in speicific post document)

                    // for each object in comcontents, set the commentsHTML to display the comment posted user's id and content of comment
                    let commentsHTML = '';
                    for (const commentObj of comcontents) {
                        const commentId = commentObj.commentid;
                        const commentContent = commentObj.comment;
                        commentsHTML += `
                            <div class="get_comment">
                                <div class="comment_id">${commentId}</div>
                                <div class="comment_content">${commentContent}</div>
                            </div>
                        `;
                    }

                    // add commentsHTML in getpage
                    $('.getpage').append(commentsHTML);
                }

                // Show the "getpage", "gotopostpage" button and entering comments section. Hide the else
                $('.post').hide();
                $('.getpage').show();
                $('#gotopostpage').show();
                $('.entercomment').show();
                $('.post-button').hide();
            });
        }

        // If user logged in user can post anything
        if (sessionStorage.getItem("id")) {
            $('.post-button').show();
        }
        else $('.post-button').hide(); // If no user logged in, hide the post button

        // Hide unnecessary elements and display only the list of saved posts
        $('.getpostinput').hide();
        $('#gotopostpage').hide();
        $('.entercomment').hide();
        $('.post').show();

        // If user want to see the list of saved posts, user click this button
        $('#gotopostpage').click(function () {
            // Hide the clicked pages contents, display the list of saved posts
            $('.getpage').hide();
            $('#gotopostpage').hide();
            $('.post').show();
            $('.entercomment').hide();

            // Then reload the page
            location.reload();
        })

        // Get the collection from DB, informations about posted pages
        const newdb = getFirestore(app);
        const pageCollection = collection(newdb, 'post-page');

        // get stored pages in DB
        async function fetchDataAndSort() {
            try {
                const querySnapshot = await getDocs(pageCollection);
                const dataArr = [];
        
                // For each data in stored pages, push it to array
                querySnapshot.forEach((doc) => {
                    const data = doc.data();     
                    const dateObject = new Date(data.date);          
                    dataArr.push({ id: doc.id, ...data, date: dateObject });
                });
        
                // Sort the data array based on the 'date' property in descending order
                dataArr.sort((a, b) => b.date - a.date);
        
                // Iterate through the sorted array and call addTableRow
                for (const item of dataArr) {
                    addTableRow(item.id, item.userid, item.title, item.comcontents, item.contents, item.date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
                }
        
            } catch (error) {
                console.error("Error getting documents: ", error);
            }
        }
        
        // Call the function
        fetchDataAndSort();

        // In the clicked page (in the lists of posted pages), if comments adding button is clicked
        $('.uploadcomment').click(function () {

            // Check if user logined
            if (sessionStorage.getItem("id")) {
                // User is logged in, then get the comment data, and user's id from sessionStorage
                var comment = $('#entercomment').val();
                comment = comment.replace(/\n/g, "<br>");
                var commentid = sessionStorage.getItem("id");
                commentid += " (";
                commentid += new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' });
                commentid += ")";
                
                // Get the document by using variable docidnow
                const docRef = doc(pageCollection, docidnow);

                getDoc(docRef).then((doc) => {
                    if (doc.exists()) {
                        // Get the comments from the document, and add the newly added comment
                        const existingComments = doc.data().comcontents || [];
                        existingComments.push({ comment, commentid });

                        // Update the document, by using newly added comments list
                        updateDoc(docRef, { comcontents: existingComments }).then(() => {
                        }).catch((error) => {
                            console.error('Error updating document:', error);
                        });
                    } else {
                        // If Document does not exist
                        console.log('Document does not exist!');
                    }
                }).then(() => {
                    // If user successfully added a comment, update the current page by adding a new comment element
                    let commentsHTML = `
                            <div class="get_comment">
                                <div class="comment_id">${commentid}</div>
                                <div class="comment_content">${comment}</div>
                            </div>
                        `;
                    $('.getpage').append(commentsHTML);
                }).catch((error) => {
                    console.error('Error getting document:', error);
                });

                // CLearing the entered comment values
                $('#entercomment').val('');
            }
            else {
                // If not logined user trying to write a comment, alert it and reset the input comment value
                alert("To write a comment, you need to log in first.");
                $('#entercomment').val('');
            }
        })

        // When post button is clicked for creating a new post in DB
        $('.post-button').click(function () {

            // Get the current buttons text
            var buttonText = $(this).text();

            if (buttonText.includes("Write")) {
                // IF this button was used for writing a post, hide the list of posts, and show the post creating sections 
                $('.post').hide();
                $('.getpostinput').show();
                $('.post-button').css("transform", "translateY(-80px)");

                // Set the button text to "Cancel Posting";
                $('.post-button').text("Cancle Posting");
            } else {
                // If this button was used for cancel writing a post, hide the post creating section, and show the list of posts
                $('.post').show();
                $('.getpostinput').hide();
                $('.post-button').css("transform", "none");

                // Set the button text to "Write Post"
                $('.post-button').text("Write Post");
                $('#title').val("");
                $('#content').val("");
            }
        })

        // If post is created and trying to upload it in the DB
        $('#send').click(function () {

            // Get the user inputed title and contents
            var title = $('#title').val();
            var content = $('#content').val();

            // Replace any '\n' in the content to <br>, so in html line can be changed!
            content = content.replace(/\n/g, "<br>");
            if (title && content) {
                // If both exists, get the current date and format it
                const currentDate = new Date();
                const formattedDate = currentDate.toLocaleString('en-US', { hour12: false });

                // Add new document (new post) in the DB
                addDoc(pageCollection, {
                    userid: sessionStorage.getItem("id"),
                    date: formattedDate,
                    title: title,
                    contents: content,
                    comcontents: [],
                }).then(() => {
                    // If successfully added, reload the page
                    window.location.href = "./community.html";
                })
            }
            else {
                // If at least one element (title or content) doesn't exist, alert the user
                alert("Please enter title and content");
            }
        })

    }
    else if (window.location.href.endsWith("user.html")) {
        // If current page is user page (used for viewing the existing user's in website DB)
        $('.edit-greet').hide();

        const newdb = getFirestore(app);

        // Get collection of user-info and workout-record
        const userCollection = collection(newdb, 'user-info');
        const workoutCollection = collection(newdb, 'workout-record');
        
        // get the current logined user id, if exists
        var logineduser = sessionStorage.getItem('id');

        getDocs(userCollection).then(async (querySnapshot) => {
            for (const docs of querySnapshot.docs) {
                // from 'user-info', get each user's id and greeting message
                const id = docs.data().id;
                var greet = docs.data().greet;

                // Make you div, and append the id
                const userDiv = $('<div class="user_info"></div>');
                userDiv.append('<div class="user_id">' + id + '</div>');
                
                // Fetch workout records for the specific user ID
                const userDocRef = doc(workoutCollection, id);
                try {
                    const docSnapshot = await getDoc(userDocRef);

                    if (docSnapshot.exists()) {
                        // get the user's workout data from 'workout-record'
                        const detailsMap = docSnapshot.data().details || {};
                        const objectSize = Object.keys(detailsMap).length;
                        // objectSize is the number of user's recorded workout count
                        userDiv.append('<div class="user_workout">' + objectSize + '</div>');
                    }
                } catch (error) {
                    console.error('Error fetching workout records:', error);
                }

                // If id is same with logined user, add "edit" icon for editing greeting message
                if (logineduser === id) {
                    greet += '<span  id="edit">✏️</span>';
                }
                userDiv.append('<div class="user_greet">' + greet + '</div>');

                // wehn edit icon is clicked, show the editing element
                $('#edit').click(function () {
                    $('.edit-greet').show();
                });

                // add "View Exercise Records", which is used for displaying that user's workout record
                const viewRecordButton = $('<button class="get_record">View Exercise Records</button>');
                userDiv.append(viewRecordButton);

                $('body').append(userDiv);

                // when that button is clicked, store the clicked user id in session storage and redirect to workout page
                viewRecordButton.click(function () {
                    sessionStorage.setItem("require-record", id);
                    window.location.href = "./workout.html";
                });

            }
        });

        // If message edit button is clicked, which is used for editing the greeting message
        $('#messageedit').click(function () {
            // Get the entered text
            var text = $('#editgreet').val();

            // If entered text exists and length is less or equal than 48, it is valid
            if (text.length > 0 && text.length <=48) {

                // Find the document of user's information exists
                const query2 = query(userCollection, where('id', '==', logineduser));

                getDocs(query2)
                    .then((querySnapshot) => {
                        if (!querySnapshot.empty) {
                            // If found a document from the query results
                            const userDocRef = querySnapshot.docs[0].ref;
                            const userData = querySnapshot.docs[0].data();

                            // update the greet message
                            const updatedData = {
                                ...userData,
                                greet: text,
                            };

                            // update the DB
                            updateDoc(userDocRef, updatedData)
                                .then(() => {
                                    // automatically reload page
                                    location.reload();
                                })
                                .catch((error) => {
                                    console.error('Error updating greeting:', error);
                                });
                        } else {
                            console.log('User document does not exist.');
                        }
                    })
                    .catch((error) => {
                        console.error('Error querying user document:', error);
                    });
            } else {
                // if text exists but long or else if doesn't exist, alert user 
                if(text.length) alert("You can't enter more than 48 characters");
                else alert('Please enter your greeting.');
            }
        });

        // If user cancelled editing greeting message
        $('#messagecancel').click(function(){
            // Set message to empty and hide the editing element.
            $('#editgreet').val("");
            $('.edit-greet').hide();
        })
    }
});