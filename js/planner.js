let events = {};
let saveTheDay = "";
let daysCount = 0;
// defining an array to save all the selected Dates.
let datesFormat = [];
let saveLastTime = [];
let allLocations = [];

// define the Maps Variables
let map, directionsRenderer, directionsService;

// define an Array to save all markers on the map
var markersArray = [];

//define an array to save the routes markers
var routesMarkers = [];

// define an array to save all directionsRender
var DirectionsRendererArray = [];
//Markers Numbers
var markerCounter = 0;
// save all Routes
var routesData = [];

//define a direction render for routes
var routesDirectionRender;

//define an array to save selectedroutes
var selectedRoutesToCompMerge = [];

//Read More button pressed
var pressed = false;

//Read More merge pressed
var mergedPressed = false;

//Save selectedActivities to disable the Add ActivityButton
var addButtonDisabled = [];

//Save the current ID to Remove if there is no Time
var staticId = [];

// Wait for the page to finish loading before calling initMap()
window.onload = function () {
  initMap();
};

// Initialize and add the map
function initMap() {
  // The location of Uluru
  const uluru = { lat: -25.344, lng: 131.031 };
  // The map, centered at Uluru
  // map = new google.maps.Map(document.getElementById("map"), {
  //   zoom: 13,
  //   center: uluru,
  // });
  map = new google.maps.Map(document.getElementById("map2"), {
    zoom: 13,
    center: uluru,
  });
  google.maps.event.addListener(map, "click", function (event) {
    this.setOptions({ scrollwheel: true });
  });
}

// defining an array to save the activities
const activitiesData = [];
// defining an array to save selected activities
const selectedActivities = [];
// fetching the activities collection from mongodb
fetch("https://visittheworld.onrender.com/activitydata")
  .then((response) => {
    return response.json();
  })
  .then((result1) =>
    result1.forEach((element) => {
      activitiesData.push(element);
    })
  )
  .then(console.log("activities From DataBase", activitiesData))
  .catch((err) => console.log(err));

//creating multiple arrays to save the multiple dates
function createDateFormatArrays(i) {
  for (let a = 0; a < i.length; a++) {
    var newArray = [];
    datesFormat.push(newArray);
  }
}

//creating multiple arrays to save the multiple selectedAvtivities and distances every day
var allSelectedActivitiesAndDistance = [];
function createSelectedActivityDistanceArrays(i) {
  for (let a = 0; a < i; a++) {
    var newArray = [];
    allSelectedActivitiesAndDistance.push(newArray);
  }
}

//creating multiple arrays to save the multiple selectedAvtivities every day
var allSelectedActivities = [];
function createSelectedActivityArrays(i) {
  for (let a = 0; a < i; a++) {
    var newArray = [];
    allSelectedActivities.push(newArray);
  }
}

//creating m,ultiple arrays to save the multiple selections for every day
var allselectingArrays = [];
function createArrays(i) {
  for (let a = 0; a < i; a++) {
    var day = 0;
    var country = "";
    var city = "";
    var activity = "";
    var arrive = 0;
    var leave = 0;
    var sleep = 0;
    var newArray = [day, country, city, activity, arrive, leave, sleep];
    allselectingArrays.push(newArray);
  }
}

function createSelectedDiv(array) {
  for (let i = 0; i < array.length; i++) {
    var temparray = array[i];
    $(`<div class="row event my-3">
      <div class="col-lg-2 col-md-12 event-left">
        <div class="event-date">
          <div class="date">${temparray[0]}</div>
          <div class="month">${temparray[1]}</div>
        </div>
      </div>
      <div class="col-lg-10 col-md-12 event-right" id="selectedDiv${i}">
        <div class="container activities w-100">

          <div class="swiper selectedSwiper${i}">

          <div class="swiper-wrapper selectedwrap${i} wrapper-style">

          </div>
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
          </div>
      </div>
      </div>
      </div>
    </div>`).appendTo($(".event-container"));
  }
  createSwiperForSelectedDivs(array.length);
}

function defineSlider() {
  for (let i = 0; i < daysCount; i++) {
    var swiperId = ".activitySwiper" + i;
    var swiper = new Swiper(swiperId, {
      observer: true,
      observeParents: true,
      loop: false,
      grabCursor: true,
      spaceBetween: 20,
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      breakpoints: {
        0: {
          slidesPerView: 1,
        },
        768: {
          slidesPerView: 2,
        },
        991: {
          slidesPerView: 3,
        },
      },
    });

    swiper.update();
  }
}

function createSwiperForSelectedDivs(arrayLength) {
  for (let i = 0; i < arrayLength; i++) {
    var swiperId = ".selectedSwiper" + i;
    new Swiper(swiperId, {
      observer: true,
      observeParents: true,
      loop: false,
      grabCursor: true,
      spaceBetween: 20,
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      breakpoints: {
        0: {
          slidesPerView: 1,
        },
        768: {
          slidesPerView: 2,
        },
        991: {
          slidesPerView: 3,
        },
      },
    });
  }
}

$(function () {
  $(".date-picker").datepicker({
    dateFormat: "D, d M",
  });
});

//TODO add event for start and end when it filled make event
// return days count between trip-start and trip-end
$("#trip-end").datepicker({
  onSelect: function (days) {
    var startDate = $("#trip-start").datepicker("getDate");
    var endDate = $("#trip-end").datepicker("getDate");

    var dates = [];
    for (
      var date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      dates.push(new Date(date));
    }
    createDateFormatArrays(dates);
    for (let i = 0; i < dates.length; i++) {
      datesFormat[i].push(dates[i].getDate());
      datesFormat[i].push(
        dates[i].toLocaleString("default", { month: "long" })
      );
      datesFormat[i].push(dates[i].getFullYear());
    }
    var a = startDate.getTime(),
      b = endDate.getTime(),
      c = 24 * 60 * 60 * 1000,
      diffDays = Math.round(Math.abs((a - b) / c));
    let allPosts = "";
    for (let i = 0; i < diffDays + 1; i++) {
      daysCount++;
      allPosts += `
            <div class="container mt-4" data-dayId="day${i}" id="duration-type-planner-container">
            <form>
            <div class="postDayBage">
            <span>Day ${i + 1}</span>
            </div>
        <div class="row">
            <div class="col-lg-2 col-md-6">
            <select id="inputGroupSelect01" name="selectcountry" data-id="${i}">
            <option selected>Country</option>
            <option value="Germany">Germany</option>
            <option value="Usa">USA</option>
            <option value="Netherlands">Netherlands</option>
            <option value="Italy">Italy</option>
            </select>
            </div>
            <div class="col-lg-2 col-md-6">
            <select id="inputGroupSelect01" name="selectcity" data-id="${i}">
            <option selected>City</option>
            <option value="Munich">Munich</option>
            <option value="Hamburg">Hamburg</option>
            <option value="Berlin">Stuttgart</option>
            </select>    
            </div>
            <div class="col-lg-2 col-md-6">
            <select id="inputGroupSelect01" name="selectactivity" data-id="${i}">
            <option selected>Activity</option>
            <option value="Swimming">Swimming</option>
            <option value="Nature">Nature</option>
            <option value="Sport">Sport</option>
            <option value="City Tour">City Tour</option>
            <option value="Museum">Museum</option>
            </select> 
            </div>
            <div class="col-lg-2 col-md-6">
            <input  name="selectarrive" type="time" id="time-selector" data-id="${i}" placeholder="Arrival time">
            </div>
            <div class="col-lg-2 col-md-6">
            <input  name="selectleave" type="time" id="time-selector" data-id="${i}" placeholder="Leave time">
            </div>
            <div class="col-lg-2 col-md-6">
            <input   name="selectsleep" type="number" id="duration" name="duration" placeholder="Sleep Duration" data-id="${i}">
            </div>
        </div>
        <div class="row">
        <div class="container activities mt-5">

        <div class="swiper activitySwiper${i}">

            <div class="swiper-wrapper wrap${i}">

            </div>
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
        </div>
       
      </div>
        </div>
            </form>
          </div>
`;
      previews.innerHTML = allPosts;
      defineSlider();
      //getActivity();
    }

    $(`<section class="container event-container">
            <h1 class="title" style="margin-bottom: 4rem">${dates[0].getFullYear()}</h1>
            </section>`).appendTo(previews);
    // $(` <div class="container event-container">
    //         <h3 class="year">${dates[0].getFullYear()}</h3>
    //         </div>`).appendTo(previews);

    createSelectedDiv(datesFormat);
    // call create arrays method
    createArrays(diffDays + 1);
    // call create selectedActivitiesArray
    createSelectedActivityArrays(diffDays + 1);
    // call create selected arrays with distance
    createSelectedActivityDistanceArrays(diffDays + 1);
    //save selected values
    $(document).ready(function () {
      //save selected country and day
      $("select[name=selectcountry]").change(function () {
        var day = $(this).attr("data-id");
        var tempoArray = allselectingArrays[day];
        tempoArray[0] = day;
        tempoArray[1] = $(this).val();
      });

      //save selected city
      $("select[name=selectcity]").change(function () {
        var day = $(this).attr("data-id");
        var tempoArray = allselectingArrays[day];
        tempoArray[2] = $(this).val();
        const filledEnough = checkAllInfoFilled(day);
        if (filledEnough) {
          getActivity(allselectingArrays, day);
        }
      });

      // save selected activities
      $("select[name=selectactivity]").change(function () {
        var day = $(this).attr("data-id");
        var tempoArray = allselectingArrays[day];
        tempoArray[3] = $(this).val();
        const filledEnough = checkAllInfoFilled(day);
        if (filledEnough) {
          getActivity(allselectingArrays, day);
        }
      });

      $("input[name=selectarrive]").on("input", function () {
        var day = $(this).attr("data-id");
        var tempoArray = allselectingArrays[day];
        const selectedTime = $(this).val();
        tempoArray[4] = selectedTime;
      });

      $("input[name=selectleave]").on("input", function () {
        var day = $(this).attr("data-id");
        var tempoArray = allselectingArrays[day];
        const selectedTime = $(this).val();
        tempoArray[5] = selectedTime;
      });

      $("input[name=selectsleep]").on("input", function () {
        var day = $(this).attr("data-id");
        var tempoArray = allselectingArrays[day];
        const selectedDuration = $(this).val();
        tempoArray[6] = selectedDuration;
        const filledEnough = checkAllInfoFilled(day);
        if (filledEnough) {
          getActivity(allselectingArrays, day);
        }
      });
    });
  },
}); //show difference})

function checkAllInfoFilled(day) {
  var filled = false;
  const array = allselectingArrays[day];
  if (
    array[1] !== "" &&
    array[2] !== "" &&
    array[3] !== "" &&
    array[4] !== 0 &&
    array[5] !== 0 &&
    array[6] !== 0
  ) {
    filled = true;
  }
  return filled;
}

function getActivity(array, day) {
  // save variable to save in the button classname
  var buttonName = 0;
  var tempArray = array[day];
  let output = "";
  //<span class="activityPrice"> <i class="fas fa-money-bill mr-2"></i> <span>&#8364; ${item.price}</span></span>
  for (let item of activitiesData) {
    if (item.city == tempArray[2] && item.activityArt == tempArray[3]) {
      output += `
        <div class="swiper-slide" id="${item._id}">

        <div class="activity">
        <img src="${item.image}" alt="Nice Forest image" class="placeImage">
        <h1 class="place">${item.place}</h1>
        <ul class="travelFeatures">
        <li class="travelFeaturesItem activityPrice"><i class="fas fa-money-bill mr-2"></i><span>&#8364; ${item.price}</span></li>
            <li class="travelFeaturesItem duration"><i class="fas fa-stopwatch mr-2"></i><span>Duration: ${item.duration}</span></li>
            <li class="travelFeaturesItem gallery"><i class="fas fa-location-dot mr-2"></i><span>City: ${item.city}</span></li>
            <li class="travelFeaturesItem opening"><i class="fas fa-clock mr-2"></i><span>Opening Hours: ${item.opening}</span></li>
            <li class="travelFeaturesItem blogger"><i class="fas fa-user mr-2"></i><span>Blogger: ${item.blogger}</span></li>
        </ul>
        
        <div class="row justify-content-center">
            <div>
                <a href="#/" class="button activityButton${day}${buttonName}" role="button" name="${day}" id="add${day}${item._id}" data-id="${item._id}" disable-data="${item.activityArt}${day}${buttonName}">Add</a>
            </div>
            <div>
                <a href="#/" class="button">Read more</a>
            </div>
        </div>
    </div>

            </div>
    
        `;
      buttonName++;
    }
  }

  var wrapperName = ".wrap" + day;
  document.querySelector(wrapperName).innerHTML = output;

  for (let index = 0; index < buttonName; index++) {
    var classNameButtonAddActivity = "activityButton" + day + index;
    $("." + classNameButtonAddActivity).on("click", async function () {
      $(this).css({
        "text-decoration": "none",
        color: "black",
        "pointer-events": "none",
      });
      staticId = [];
      staticId.push($(this).attr("data-id"), $(this).attr("disable-data"));
      checkAddingActivity($(this).attr("name"), $(this).attr("data-id"));
      addButtonDisabled.push($(this).attr("id"));
    });
  }

  //TODO
  console.log("selected Activities", allSelectedActivities);
  console.log("disbaleArray", addButtonDisabled);
  allSelectedActivities[day].forEach((activity) => {
    console.log("buttonId", `#add${day}${activity.id}`);
    $(`#add${day}${activity.id}`).css({
      "text-decoration": "none",
      color: "black",
      "pointer-events": "none",
    });
  });
}

async function checkAddingActivity(day, id) {
  var currentArray = allselectingArrays[day];
  var currentArrayDistance = allSelectedActivitiesAndDistance[day];
  saveTheDay = day;
  var arriveTime = currentArray[4];
  var leaveTime = currentArray[5];
  var sleepDuration = currentArray[6];
  var selectedArray = allSelectedActivities[day];
  var activity = activitiesData.find((item) => item._id == id);
  var openingTime = activity.opening;
  const [openingTimeStr, closingTimeStr] = splitOpeningTime(openingTime);
  var activityDuration = activity.duration;
  var duration = getDurationInMin(activityDuration);
  var onebeforeelement = "";
  if (selectedArray.length == 0) {
    var finishTime = addMinutesToTime(openingTimeStr, duration);
    selectedArray.push({
      kind: "Activity",
      id: activity._id,
      location: activity.location,
      day: saveTheDay,
      start: openingTimeStr,
      duration: getDurationInMin(activity.duration),
      open: openingTimeStr,
      close: closingTimeStr,
      end: finishTime,
    });
    await fetch("https://localhost:5500/addActivity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        day: saveTheDay,
        id: activity._id,
      }),
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .catch(function (error) {
        console.error("Error:", error);
      });
    addDistances(selectedArray, currentArrayDistance);
  } else {
    // calculating distance
    var currentLocation = activity.location;
    var lastActivity = activitiesData.find(
      (item) => item._id == selectedArray[selectedArray.length - 1].id
    );
    var lastLocation = lastActivity.location;
    const [success, freeSlotStartTime, freeSlotEndTime] = getAllBusyTimes(
      openingTimeStr,
      closingTimeStr,
      duration,
      arriveTime,
      leaveTime,
      selectedArray
    );
    if (success) {
      selectedArray.push({
        kind: "Activity",
        id: activity._id,
        day: saveTheDay,
        location: activity.location,
        duration: getDurationInMin(activity.duration),
        open: openingTimeStr,
        close: closingTimeStr,
        start: freeSlotStartTime,
        end: freeSlotEndTime,
      });
      await fetch("https://visittheworld.onrender.com/addActivity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day: saveTheDay,
          id: activity._id,
        }),
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.json();
        })
        .catch(function (error) {
          console.error("Error:", error);
        });
      addDistances(selectedArray, currentArrayDistance);
    } else {
      //enable the addActivity button again
      $(`[disable-data="${staticId[1]}"]`).css({
        "text-decoration": "none",
        color: "blue",
        "pointer-events": "auto",
      });
      showAlert("time", activity.place);
    }
  }
}

async function addDistances(selectedArray1, currentArrayDistance1, day) {
  var onebeforeelement = "";
  var selectedArray = sortEvents(selectedArray1);
  currentArrayDistance1 = [];
  currentArrayDistance1.push(selectedArray[0]);
  // check if more than one element and if the next element is available:
  const promises = [];
  for (let index = 0; index < selectedArray.length; index++) {
    const element = selectedArray[index];
    const nextelement = selectedArray[index + 1];
    if (nextelement != null) {
      const elementActivity = activitiesData.find(
        (item) => item._id == element.id
      );
      const nextelementActivity = activitiesData.find(
        (item) => item._id == nextelement.id
      );
      promises.push(
        await calculateDistance(
          elementActivity.location,
          nextelementActivity.location
        )
          .then(([time1, time, distance]) => {
            if (index == 0) {
              //currentArrayDistance1.push(element);
              currentArrayDistance1.push({
                kind: "Drive",
                day: saveTheDay,
                time: time1,
                from: elementActivity._id,
                to: nextelementActivity._id,
                start: element.end,
                end: addMinutesToTime(element.end, time),
                distance: distance,
              });
              onebeforeelement = addMinutesToTime(element.end, time);
            } else {
              currentArrayDistance1.push({
                kind: "Activity",
                id: element.id,
                day: saveTheDay,
                duration: element.duration,
                open: element.open,
                close: element.close,
                start: onebeforeelement,
                end: addMinutesToTime(onebeforeelement, element.duration),
              });
              onebeforeelement = addMinutesToTime(
                onebeforeelement,
                element.duration
              );
              currentArrayDistance1.push({
                kind: "Drive",
                time: time1,
                day: saveTheDay,
                from: elementActivity._id,
                to: nextelementActivity._id,
                start: onebeforeelement,
                end: addMinutesToTime(onebeforeelement, time),
                distance: distance,
              });
              onebeforeelement = addMinutesToTime(onebeforeelement, time);
              return addMinutesToTime(onebeforeelement, time);
            }
          })
          .catch((error) => {
            console.error(error);
          })
      );
    }
  }
  await Promise.all(promises);
  addLastDistance(selectedArray, currentArrayDistance1, day);
  if (promises.length > 0) {
    const lastTime = await promises[promises.length - 1];
    saveLastTime.push(lastTime);
  }
}

async function addLastDistance(selectedArrays, currentDistance, day) {
  var currentArray = allselectingArrays[saveTheDay];
  var arriveTime = currentArray[4];
  var leaveTime = currentArray[5];
  var lastSelect = selectedArrays[selectedArrays.length - 1];
  var lastTimeReversed = saveLastTime.slice().reverse();
  var updatedActivitiesTimes = [];
  var lastDrive = lastTimeReversed[0];

  if (selectedArrays.length > 1) {
    currentDistance.push({
      kind: "Activity",
      id: lastSelect.id,
      duration: lastSelect.duration,
      day: lastSelect.day,
      open: lastSelect.open,
      close: lastSelect.close,
      start: currentDistance[currentDistance.length - 1].end,
      end: addMinutesToTime(
        currentDistance[currentDistance.length - 1].end,
        lastSelect.duration
      ),
    });
  }
  if (selectedArrays && selectedArrays.length > 0) {
    for (let i = 0; i < currentDistance.length; i++) {
      if (currentDistance[i].kind == "Activity") {
        updatedActivitiesTimes.push(currentDistance[i]);
      }
    }

    for (let i = 0; i < updatedActivitiesTimes.length; i++) {
      const [success, id] = checkTimesAfterDistance(
        updatedActivitiesTimes[i].id,
        updatedActivitiesTimes[i].open,
        updatedActivitiesTimes[i].close,
        updatedActivitiesTimes[i].start,
        updatedActivitiesTimes[i].end,
        arriveTime,
        leaveTime
      );
      if (!success) {
        console.log("hatha ho", updatedActivitiesTimes[i]);
        console.log("hen", updatedActivitiesTimes);
        var theItem = updatedActivitiesTimes.find((item) => item.id == id);
        var theDay = theItem.day;
        let place = activitiesData.find((i) => i._id === id)?.place;
        await fetch("https://localhost:5500/deleteActivity", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            day: theDay,
            id: staticId[0],
          }),
        })
          .then(function (response) {
            if (!response.ok) {
              throw new Error(response.statusText);
            }
            return response.json();
          })
          .catch(function (error) {
            console.error("Error:", error);
          });
        // Remove element from currentDistance
        const index1 = currentDistance.findIndex(
          (item) => item.id === staticId[0]
        );
        if (index1 !== -1) {
          currentDistance.splice(index1, 1);
        }

        // Remove element from currentDistance with 'to' property matching id
        const index2 = currentDistance.findIndex(
          (item) => item.to === staticId[0]
        );
        if (index2 !== -1) {
          currentDistance.splice(index2, 1);
        }

        // Remove element from allselectingArrays[day]
        const index3 = allselectingArrays[saveTheDay].findIndex(
          (item) => item.id === staticId[0]
        );
        if (index3 !== -1) {
          allselectingArrays[saveTheDay].splice(index3, 1);
        }

        // Remove element from selectedArrays
        const index4 = selectedArrays.findIndex(
          (item) => item.id === staticId[0]
        );
        if (index4 !== -1) {
          selectedArrays.splice(index4, 1);
        }

        const index5 = allSelectedActivities[saveTheDay].findIndex(
          (item) => item.id === staticId[0]
        );
        if (index5 !== -1) {
          allSelectedActivities[saveTheDay].splice(index5, 1);
        }

        //enable the addActivity button again
        $(`[disable-data="${staticId[1]}"]`).css({
          "text-decoration": "none",
          color: "blue",
          "pointer-events": "auto",
        });

        addDistances(selectedArrays, currentDistance, day);
        showAlert("time", place);
      } else {
        addActivitiesAndDistancesToPlan(currentDistance, day);
      }
    }
  } else {
    addActivitiesAndDistancesToPlan(currentDistance, day);
  }
  getLocations();
}

function checkTimesAfterDistance(
  id,
  open,
  close,
  start,
  end,
  arriveTime,
  leaveTime
) {
  var succes = true;
  if (
    timeToMinutes(start) >= timeToMinutes(open) &&
    timeToMinutes(start) <= timeToMinutes(close) &&
    timeToMinutes(end) <= timeToMinutes(close) &&
    timeToMinutes(end) <= timeToMinutes(leaveTime)
  ) {
    return [succes, id];
  } else {
    succes = false;
    return [succes, id];
  }
}

async function deleteActivity(day, id) {
  var selectedArray = allSelectedActivities[day];
  const index1 = selectedArray.findIndex((item) => item.id === id);
  if (index1 !== -1) {
    selectedArray.splice(index1, 1);
  }
  var newArray = [];
  addDistances(selectedArray, newArray, day);

  await fetch("https://visittheworld.onrender.com/deleteActivity", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      day: day,
      id: id,
    }),
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .catch(function (error) {
      console.error("Error:", error);
    });

  $(`#add${day}${id}`).css({
    "text-decoration": "none",
    color: "blue",
    "pointer-events": "auto",
  });
}

function calculateDistance(origin, destination) {
  return new Promise((resolve, reject) => {
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: "DRIVING",
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
      },
      function (response, status) {
        if (status == "OK") {
          const distance = response.rows[0].elements[0].distance.value / 1000; // in kilometers
          const time = response.rows[0].elements[0].duration.text; // in text format (e.g. "1 hour 30 mins")

          // parse time value to minutes
          let minutes = 0;
          const timeParts = time.split(" ");
          for (let i = 0; i < timeParts.length; i++) {
            if (
              timeParts[i] === "Stunden," ||
              timeParts[i] === "Stunde," ||
              timeParts[i] === "Std.,"
            ) {
              minutes += parseInt(timeParts[i - 1]) * 60;
            } else if (
              timeParts[i] === "Minuten" ||
              timeParts[i] === "Minute"
            ) {
              minutes += parseInt(timeParts[i - 1]);
            }
          }

          resolve([time, minutes, distance]); // pass the values to resolve
        } else {
          reject(new Error("Error in calculateDistance"));
        }
      }
    );
  });
}

function getAllBusyTimes(
  openTime,
  closeTime,
  activityDuration,
  arrivalTime1,
  leaveTime1,
  array
) {
  var freeSlotStartTime = "";
  var freeSlotEndTime = "";
  var success = false;
  // Define the activity opening and closing times and duration
  const activityOpeningTimeStr = openTime;
  const activityClosingTimeStr = closeTime;
  const activityDurationInMinutes = activityDuration;

  // Define an array of scheduled events
  const scheduledEvents = array;

  // Define the arrival time and leave time
  const arrivalTimeStr = arrivalTime1;
  const leaveTimeStr = leaveTime1;

  // Convert arrival time and leave time to minutes
  const arrivalTimeInMinutes = timeToMinutes(arrivalTimeStr);
  const leaveTimeInMinutes = timeToMinutes(leaveTimeStr);

  // Define a variable to track the start and end times of the first free slot found
  let freeSlotStartTimeInMinutes = null;
  let freeSlotEndTimeInMinutes = null;

  // Loop over the minutes from the opening time to the closing time of the activity
  for (
    let i = timeToMinutes(activityOpeningTimeStr);
    i <= timeToMinutes(activityClosingTimeStr) - activityDurationInMinutes;
    i++
  ) {
    const proposedStartTimeInMinutes = i;
    const proposedEndTimeInMinutes = i + activityDurationInMinutes;
    let isOverlapping = false;

    // Check if the proposed time slot overlaps with any of the scheduled events
    for (let j = 0; j < scheduledEvents.length; j++) {
      const event = scheduledEvents[j];
      const eventStartTimeInMinutes = timeToMinutes(event.start);
      const eventEndTimeInMinutes = timeToMinutes(event.end);
      if (
        proposedEndTimeInMinutes > eventStartTimeInMinutes &&
        proposedStartTimeInMinutes < eventEndTimeInMinutes
      ) {
        // There is an overlap with this event, so skip to the next proposed time slot
        isOverlapping = true;
        break;
      }
    }

    // Check if the proposed time slot is after the arrival time and before the leave time
    if (
      proposedEndTimeInMinutes <= leaveTimeInMinutes &&
      proposedStartTimeInMinutes >= arrivalTimeInMinutes
    ) {
      if (!isOverlapping) {
        // There is no overlap with any of the scheduled events, so a free slot has been found
        freeSlotStartTimeInMinutes = proposedStartTimeInMinutes;
        freeSlotEndTimeInMinutes = proposedEndTimeInMinutes;
        break;
      }
    }
  }

  if (
    freeSlotStartTimeInMinutes !== null &&
    freeSlotEndTimeInMinutes !== null
  ) {
    // There is a free slot for the activity, so convert the start and end times to HH:MM format and print them
    freeSlotStartTime = new Date(
      0,
      0,
      0,
      Math.floor(freeSlotStartTimeInMinutes / 60),
      freeSlotStartTimeInMinutes % 60
    ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    freeSlotEndTime = new Date(
      0,
      0,
      0,
      Math.floor(freeSlotEndTimeInMinutes / 60),
      freeSlotEndTimeInMinutes % 60
    ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    console.log(
      `The first free slot for the activity is between ${freeSlotStartTime} and ${freeSlotEndTime}.`
    );
    success = true;
  } else {
    console.log(
      "There is no free slot for the activity during the specified opening hours."
    );
  }

  return [success, freeSlotStartTime, freeSlotEndTime];
}

// Define a function to convert time in HH:MM format to minutes
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":");
  return parseInt(hours) * 60 + parseInt(minutes);
}

// define a function to reurn the duration of an activity in minutes
function getDurationInMin(actDuration) {
  const timeArr = actDuration.split(" ");
  const timeInMinutes = parseInt(timeArr[0]) * 60;
  return timeInMinutes;
}
// Define a function to sort the event sto ensure that the events are shown in the right sequence
function sortEvents(array) {
  array.sort((a, b) => {
    // Convert the start times to minutes since midnight
    const aStartMinutes = timeToMinutes(a.start);
    const bStartMinutes = timeToMinutes(b.start);

    // Compare the start times
    if (aStartMinutes < bStartMinutes) {
      return -1;
    } else if (aStartMinutes > bStartMinutes) {
      return 1;
    } else {
      return 0;
    }
  });

  return array;
}

//Define a function to split the opening and closing hours of an activity
function splitOpeningTime(opening) {
  const timeStr = opening;

  // Split the time string by the delimiter "-"
  const [openingTimeStr, closingTimeStr] = timeStr.split(" - ");

  // Format opening and closing times as time strings in 24-hour format
  const [openingHourStr, openingMinuteStr] = openingTimeStr.split(":");
  const [closingHourStr, closingMinuteStr] = closingTimeStr.split(":");
  const openingTimeFormatted = `${openingHourStr.padStart(
    2,
    "0"
  )}:${openingMinuteStr.padStart(2, "0")}`;
  const closingTimeFormatted = `${closingHourStr.padStart(
    2,
    "0"
  )}:${closingMinuteStr.padStart(2, "0")}`;

  //console.log("Opening Time:", openingTimeFormatted);
  //console.log("Closing Time:", closingTimeFormatted);
  return [openingTimeFormatted, closingTimeFormatted];
}

//define a function to add minutes to a specific time
function addMinutesToTime(time, minCount) {
  const [hour, minute] = time.split(":").map(Number);
  const totalMinutes = hour * 60 + minute + minCount;
  const newHour = Math.floor(totalMinutes / 60) % 24;
  const newMinute = totalMinutes % 60;
  return `${String(newHour).padStart(2, "0")}:${String(newMinute).padStart(
    2,
    "0"
  )}`;
}

function addActivitiesAndDistancesToPlan(currentDistance, day) {
  var day1 = saveTheDay;
  if (day != null) {
    day1 = day;
  }
  var output = "";
  if (currentDistance && currentDistance.length > 0) {
    for (let i = 0; i < currentDistance.length; i++) {
      if (currentDistance[i] != undefined) {
        if (currentDistance[i].kind == "Activity") {
          var item = currentDistance[i];
          var activity = activitiesData.find(
            (item) => item._id == currentDistance[i].id
          );
          output += `  <div class=" swiper-slide" id="selected${item.day}${item.id}">
        <div class="card-flyer">
            <div class="text-box">
                <div class="image-box">
                    <img src="${activity.image}" alt="" />
                </div>
                <div class="text-container  my-3">
                    <h6 class="place">${activity.place}</h6>
                    <p><i class="fas fa-clock mr-2"></i><span>${item.start} - ${item.end}</span></p>
                    <p>Blogger: ${activity.blogger}</p>
                </div>
            </div>
            <a href="#/" class="button removeButton1 removeButton${item.day}${item.id}" role="button" name="${item.day}" id="remove${item.id}${item.day}" data-id="${item.id}">Remove</a>
        </div>
  </div>`;
        }
        if (currentDistance[i].kind == "Drive") {
          var distItem = currentDistance[i];
          output += ` <div class="  marker-info-box swiper-slide">
        <div class="marker-wrapper">
        <div class="marker-action">
          <span class="btn">
                  <i class='fas fa-car' style='font-size:24px;color:white'></i>
                  Car
                </span>
        </div>
        <div class="distance marker-distance">
          <span class="head-title">
                  Distance
                </span>
          <span>${distItem.distance} km</span>
        </div>
        <div class="distance distance-time">
          <span class="head-title">
                  Time
                </span>
          <span>${distItem.time}</span>
        </div>
        </div>
        </div>
        </div>`;
        }
      }
    }
    $(".selectedwrap" + day1).html(output);

    // $(`.removeButton1`).on('click', async function () {
    //   console.log("yes im trying to delete");
    //     deleteActivity(($(this).attr("name")), ($(this).attr("data-id")));
    // });
  } else {
    $(".selectedwrap" + day1).html(output);
  }

  //getLocations();
}

//initialise all the removebutton and add onClickListener
$(document).ready(function () {
  // add event listener for remove buttons
  $(document).on("click", ".removeButton1", function () {
    var day = $(this).attr("name");
    var id = $(this).data("id");
    // call removeActivityFromPlan() with the appropriate parameters
    deleteActivity(day, id);
  });
});

// a function to draw the route on the map
function drawMapsRoutes(start, end, waypoints, type, color) {
  var request;
  directionsService = new google.maps.DirectionsService();
  if (waypoints.length == 0) {
    request = {
      origin: start,
      destination: end,
      optimizeWaypoints: true,
      travelMode: "DRIVING",
    };
  } else {
    request = {
      origin: start,
      destination: end,
      waypoints: waypoints,
      optimizeWaypoints: true,
      travelMode: "DRIVING",
    };
  }

  if (type == "dotted") {
    routesDirectionRender = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      suppressPolylines: true,
    });
    routesDirectionRender.setMap(map);

    directionsService.route(request, function (result, status) {
      if (status == "OK") {
        routesDirectionRender.setDirections(result);
        // Set dotted polyline
        var path = [];
        var legs = result.routes[0].legs;
        for (var i = 0; i < legs.length; i++) {
          var steps = legs[i].steps;
          for (var j = 0; j < steps.length; j++) {
            var nextSegment = steps[j].path;
            for (var k = 0; k < nextSegment.length; k++) {
              path.push(nextSegment[k]);
            }
          }
        }
        var dottedPolyline = new google.maps.Polyline({
          path: path,
          strokeColor: color,
          strokeOpacity: 0,
          icons: [
            {
              icon: {
                path: "M 0,-1 0,1",
                strokeOpacity: 1,
                scale: 3,
              },
              offset: "0",
              repeat: "20px",
            },
          ],
          map: map,
        });
      }
    });
  } else {
    directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
    });
    directionsRenderer.setMap(map);
    directionsService.route(request, function (result, status) {
      if (status == "OK") {
        directionsRenderer.setDirections(result);
      }
    });
  }
}

// define a function to get all of the locations to draw the route on the map
function getLocations() {
  let start = "";
  let end = "";
  let waypoints = [];
  let theLocations = [];
  for (let i = 0; i < allSelectedActivities.length; i++) {
    for (let j = 0; j < allSelectedActivities[i].length; j++) {
      let actualArray = allSelectedActivities[i];
      var activity = activitiesData.find(
        (item) => item._id == actualArray[j].id
      );
      var image = activity.image;
      var place = activity.place;
      var blogger = activity.blogger;
      var activityArt = activity.activityArt;
      theLocations.push({
        id: actualArray[j].id,
        location: actualArray[j].location,
        image: image,
        opening: `${actualArray[j].open} - ${actualArray[j].close}`,
        duration: `${actualArray[j].start} - ${actualArray[j].end}`,
        place: place,
        blogger: blogger,
        art: activityArt,
      });
    }
  }
  if (theLocations.length > 0) {
    if (theLocations.length == 1) {
      // Add only a Marker on map
      clearRoutes();
      clearMarkers();
      addMarkerToMap(
        theLocations[0].location,
        theLocations[0],
        theLocations[0].art,
        1
      );
    } else {
      if (theLocations.length == 2) {
        clearRoutes();
        clearMarkers();
        start = theLocations[0].location;
        end = theLocations[theLocations.length - 1].location;
        for (let i = 0; i < theLocations.length; i++) {
          addMarkerToMap(
            theLocations[i].location,
            theLocations[i],
            theLocations[i].art,
            i + 1,
            "original"
          );
        }
        drawMapsRoutes(start, end, waypoints, "original");
      } else {
        clearRoutes();
        clearMarkers();
        start = theLocations[0].location;
        end = theLocations[theLocations.length - 1].location;
        for (let a = 1; a < theLocations.length - 1; a++) {
          waypoints.push({
            location: theLocations[a].location,
            stopover: true,
          });
        }
        for (let i = 0; i < theLocations.length; i++) {
          addMarkerToMap(
            theLocations[i].location,
            theLocations[i],
            theLocations[i].art,
            i + 1,
            "original"
          );
        }
        drawMapsRoutes(start, end, waypoints, "original");
      }
    }
  } else {
    clearMarkers();
    clearRoutes();
  }
}

// Add Markers On the Map with custom description
async function addMarkerToMap(location, desc, art, num1, type) {
  var marker = "";
  const generatedLatLng = await geocodeAddress(location);
  const contentString = `  <div id="selected${desc.id}">
  <div class="card-flyer1">
      <div class="text-box">
          <div class="image-box">
              <img src="${desc.image}" alt="" />
          </div>
          <div class="text-container my-3">
              <h6 class="place">${desc.place}</h6>
              <p>Blogger: ${desc.blogger}</p>
          </div>
      </div>
  </div>
</div>`;
  const infowindow = new google.maps.InfoWindow({
    content: contentString,
    maxWidth: 200,
    ariaLabel: desc.place,
  });

  var image = "./assets/marker-CityTour.jpg";
  switch (art) {
    case "Nature":
      image = "./assets/marker-Nature.jpg";
      break;
    case "Swimming":
      image = "./assets/marker-Swimming.jpg";
      break;
    case "History":
      image = "./assets/historyMarker.png";
      break;
    case "Kids":
      image = "./assets/kidsMarker.jpg";
      break;
    case "Shopping":
      image = "./assets/shoppingMarker.png";
      break;
    case "Romantic":
      image = "./assets/romanticMarker.png";
      break;
    case "Festival":
      image = "./assets/festivalMarker.jpg";
      break;
    case "Games":
      image = "./assets/gamesMarker.png";
      break;
    case "Sport":
      image = "./assets/sportMarker.jpg";
      break;
  }

  if (type == "routes") {
    // Set the the marker icon
    marker = new google.maps.Marker({
      position: generatedLatLng,
      title: desc.place,
      icon: {
        labelOrigin: new google.maps.Point(30, 64),
        url: image,
        scaledSize: new google.maps.Size(60, 60),
        optimized: false,
      },
    });
  } else {
    // Set the the marker icon
    marker = new google.maps.Marker({
      position: generatedLatLng,
      title: desc.place,
      label: {
        text: num1.toString(),
        color: "red",
        fontWeight: "bold",
      },
      icon: {
        labelOrigin: new google.maps.Point(30, 64),
        url: image,
        scaledSize: new google.maps.Size(60, 60),
        optimized: false,
      },
    });

    map.setCenter(generatedLatLng);
    map.setZoom(10);
  }

  if (type == "routes") {
    routesMarkers.push(marker);
  } else {
    markersArray.push(marker);
  }

  // add the marker to the map
  marker.setMap(map);

  //marker.setMap(map);

  marker.addListener("click", () => {
    $("#selectedActivityContainer").html(contentString);

    infowindow.open({
      anchor: marker,
      map,
    });
  });
}

function geocodeAddress(the_address) {
  return new Promise(function (resolve, reject) {
    var geocoder = new google.maps.Geocoder();
    var delay = 1000;
    geocodeLoop(the_address, delay);

    function geocodeLoop(address, delay) {
      geocoder.geocode({ address: address }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          var latLng = results[0].geometry.location;
          resolve(latLng);
        } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
          setTimeout(function () {
            geocodeLoop(address, delay + 1000);
          }, delay);
        } else {
          reject(
            "Geocode was not successful for the following reason: " + status
          );
        }
      });
    }
  });
}

// Function to delete all the existing markers from the map
function clearMarkers() {
  markersArray.forEach(function (marker) {
    marker.setMap(null);
  });
  markersArray = [];
  //markerCounter = 0;
}

// Function to delete all the routes from the map
function clearRoutes() {
  if (directionsRenderer != null) {
    directionsRenderer.setMap(null);
  }
}

//TODO if not selected any activity it should be disabled
//initialise the Button to compare Routes
$(document).ready(function () {
  // add event listener for remove buttons
  $(document).on("click", "#routesButton", function () {
    if (allselectingArrays.length) {
      getAllRoutesWithSameCities();
    }
  });
});

// get All Routes With the same cities
async function getAllRoutesWithSameCities() {
  const colors = ["#FF0000", "#FF00FF", "#0000FF", "#FFFF00", "#FF00FF"];
  var saveCities = [];
  for (let i = 0; i < allselectingArrays.length; i++) {
    var tempoArray = allselectingArrays[i];
    if (tempoArray[2] != "") {
      saveCities.push(tempoArray[2]);
    }
  }

  const url = `https://localhost:5500/routes?cities=${JSON.stringify(
    saveCities
  )}`;

  await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .then(function (data) {
      data.forEach((route) => {
        routesData.push(route);
      });
    })
    .catch(function (error) {
      console.error("Error:", error);
    });

  var activitiesArray = [];
  for (let i = 0; i < routesData.length; i++) {
    var tempoArray = routesData[i];
    activitiesArray.push(tempoArray.activities);
  }

  for (let j = 0; j < activitiesArray.length; j++) {
    var temporArray = activitiesArray[j];
    var start = temporArray[0].location;
    var end = temporArray[temporArray.length - 1].location;
    var waypoints = [];
    for (let a = 1; a < temporArray.length - 1; a++) {
      waypoints.push({
        location: temporArray[a].location,
        stopover: true,
      });
    }
    for (let b = 0; b < temporArray.length; b++) {
      addMarkerToMap(
        temporArray[b].location,
        temporArray[b],
        temporArray[b].activityArt,
        b + 1,
        "routes"
      );
    }
    drawMapsRoutes(start, end, waypoints, "dotted", colors[j]);
  }

  createTables();
}

function createTables() {
  const compTable = document.getElementById("compareTable");
  const tableTitle = `<h1 class="title" style="margin-bottom: 4rem">All Routes</h1>`;
  // const tableTitle = `<h3 class="tableTitle">All Routes</h3>`;
  const tableBeginn = `<div  id="compareContainer">
  <div class="tabular-data module" id="bigTable">
  <div class="data-group data-header hidden-sm hidden-xs">
      <div class="row">
        <div class="col-lg-2 col-md-1">
          <strong class="uppercase">Select</strong>
        </div>
        <div class="col-lg-2 col-md-4">
          <strong class="uppercase">Blogger</strong>
        </div>
        <div class="col-lg-2 col-md-4">
          <strong class="uppercase">Duration</strong>
        </div>
        <div class="col-lg-2 col-md-4">
          <strong class="uppercase">type</strong>
        </div>
        <div class="col-lg-2 col-md-4">
          <strong class="uppercase">Price</strong>
        </div>
        <div class="col-lg-2 col-md-4">
          <strong class="uppercase">Info</strong>
        </div>
      </div>
    </div>
  </div>
  </div>`;
  let html = tableTitle + tableBeginn;
  // compTable.innerHTML = html;
  // $("#compareTable").html(tableBeginn).show();
  // $("#bigCompareTitle").html(tableTitle).show();
  // $("#bigCompareTitle").show();
  $("#compareTable").show().html(html);
  // .show()
  //TODO should be hidden cause of the height when its not rendered yet

  for (let i = 0; i < routesData.length; i++) {
    var currentRoute = routesData[i];
    var routeInfo = `<div class="data-group">
    <div class="row">
      <div class="data-expands">
        <div class="col-lg-2 col-md-1">
          <input type="checkbox" class="selectRoute" id="selectRoute${i}" style="width: auto!important"  data="${currentRoute._id}" name="${i}">
        </div>
        <div class="col-lg-2 col-md-4">
          <span>${currentRoute.blogger}</span>
        </div>
        <div class="col-lg-2 col-md-4">
          <span>${currentRoute.duration}</span>
        </div>
        <div class="col-lg-2 col-md-4" id="tripType${i}">
        </div>
        <div class="col-lg-2 col-md-4">
          <span>${currentRoute.costs} <i class="fa-solid fa-euro-sign"></i> </span>
        </div>
  
        <div class="col-lg-2 col-md-4">
          <span>Read More</span>
          <span class="row-toggle">
            <span class="horizontal"></span>
            <span class="vertical"></span>
          </span>
        </div>
      </div>
      <div class="expandable">
        <div class="row">
          <div class="col-lg-8 col-lg-offset-1 col-md-7 col-md-offset-1">
            <p class="citiesInfo" id="cities${i}"></p>
            <hr>
            <p class="activityArtInfo" id="activityArts${i}"></p>
            <hr>
            <p class="activitiesInfo" id="activitites${i}"></p>
            <hr>
          </div>
          <div class="col-lg-3 col-md-4">
            <div class="row">
              <div class="col-xs-12 visible-sm visible-xs"><hr></div>
              <div class="col-xs-6">Rating</div>
              <div class="col-xs-6 text-right">5<i class="fa-solid fa-star"></i></div>
              <div class="col-xs-6">Reviews</div>
              <div class="col-xs-6 text-right">click here</div>
              <div class="col-xs-6">Best Season</div>
              <div class="col-xs-6 text-right">Summer<i class="fa-solid fa-sun"></i></div>
              <div class="col-xs-12"><hr></div>
              <div class="col-xs-6">Booked</div>
              <div class="col-xs-6 text-right">10 Times</div>
              <div class="col-xs-12"><hr></div>
              <div class="col-xs-6"><a href="#" class="btn btn-black"><i class="fa fa-phone"></i> Contact</a></div>
              <div class="col-xs-6 text-right"><a href="#" class="btn btn-green"><i class="fa fa-check-circle-o"></i> Select</a></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
    $("#bigTable").append(routeInfo);
    var citiesArray = currentRoute.cities;
    var cityTitle = `<h4>Cities:</h4>`;
    $(`#cities${i}`).append(cityTitle);
    for (let j = 0; j < citiesArray.length; j++) {
      var city = `${citiesArray[j]} `;
      var arrow = `<i class="fa-solid fa-arrow-right"></i> `;
      $(`#cities${i}`).append(city);
      if (j < citiesArray.length - 1) {
        $(`#cities${i}`).append(arrow);
      }
    }

    var activitiyArtsArray = currentRoute.activitiesArts;
    var artTitle = `<h4>Arts of Activities:</h4>`;
    $(`#activityArts${i}`).append(artTitle);
    for (let a = 0; a < activitiyArtsArray.length; a++) {
      switch (activitiyArtsArray[a]) {
        case "Swimming":
          var icon = `<i class="fa-solid fa-person-swimming"></i> Swimming, `;
          $(`#activityArts${i}`).append(icon);
          break;

        case "Nature":
          var icon = `<i class="fa-solid fa-tree"></i> Nature, `;
          $(`#activityArts${i}`).append(icon);
          break;

        case "City Tour":
          var icon = `<i class="fa-solid fa-city"></i> City Tour, `;
          $(`#activityArts${i}`).append(icon);
          break;

        case "History":
          var icon = `<i class="fa-solid fa-landmark"></i> History, `;
          $(`#activityArts${i}`).append(icon);
          break;

        case "Kids":
          var icon = `<i class="fa-solid fa-children"></i> Kids, `;
          $(`#activityArts${i}`).append(icon);
          break;

        case "Sport":
          var icon = `<i class="fa-solid fa-person-running"></i> Sport, `;
          $(`#activityArts${i}`).append(icon);
          break;

        case "Festival":
          var icon = `<i class="fa-solid fa-holly-berry"></i> Festival, `;
          $(`#activityArts${i}`).append(icon);
          break;

        case "Games":
          var icon = `<i class="fa-solid fa-gamepad"></i> Games, `;
          $(`#activityArts${i}`).append(icon);
          break;

        case "Romantic":
          var icon = `<i class="fa-solid fa-heart"></i> Romantic, `;
          $(`#activityArts${i}`).append(icon);
          break;
      }
    }

    var routesActivitiesArray = currentRoute.activities;
    var activitiesTitle = `<h4> Activities </h4`;
    $(`#activitites${i}`).append(activitiesTitle);
    for (let b = 0; b < routesActivitiesArray.length; b++) {
      var theActivtiyName = routesActivitiesArray[b].place;
      var activityToAdd = `${theActivtiyName} `;
      var icon = `<i class="fa-solid fa-minus"></i> `;
      $(`#activitites${i}`).append(activityToAdd);
      if (b < routesActivitiesArray.length - 1) {
        $(`#activitites${i}`).append(icon);
      }
    }

    var thisTripType = currentRoute.tripType;
    switch (thisTripType) {
      case "Family":
        var tripTypeIconText = `<div class="green uppercase"><strong><i class="fa-solid fa-people-roof"></i> Family </strong>
      </div>`;
        $(`#tripType${i}`).append(tripTypeIconText);
        break;

      case "Friends":
        var tripTypeIconText = `<div class="blue uppercase"><strong><i class="fa-solid fa-user-group"></i> Friends </strong>
      </div>`;
        $(`#tripType${i}`).append(tripTypeIconText);
        break;

      case "Young Couple":
        var tripTypeIconText = `<div class="red uppercase"><strong><i class="fa-regular fa-face-kiss-wink-heart"></i> Young Couple </strong>
      </div>`;
        $(`#tripType${i}`).append(tripTypeIconText);
        break;
    }
  }

  const buttons = `<div class="row">
    <div class="col-6">
    <button class="btn custom-btn btn-3 compareButton1" id="compareButton">Compare selected routes</button>
    </div>
    <div class="col-6">
    <button class="btn custom-btn btn-3" id="mergeButton"><span>Merge selected routes</span></button>
    </div> 
    </div>`;

  $("#bigTable").append(buttons);

  // Expandable Data Table
  $(".data-expands").each(function () {
    $(this).click(function () {
      $(this).toggleClass("row-active");
      $(this).parent().find(".expandable").toggleClass("row-open");
      $(this).parent().find(".row-toggle").toggleClass("row-toggle-twist");
    });
  });
}

$(document).ready(function () {
  $(document).on("click", ".selectRoute", function () {
    var routeId = $(this).attr("data");
    var buttonId = $(this).attr("id");
    addRemoveSelectedRoute(routeId, buttonId);
  });
});

function addRemoveSelectedRoute(routeId, buttonId) {
  var idToCheck = "" + buttonId;
  if (document.getElementById(idToCheck).checked) {
    var route = routesData.find((item) => item._id == routeId);
    selectedRoutesToCompMerge.push(route);
  } else {
    const index = selectedRoutesToCompMerge.findIndex(
      (item) => item._id === routeId
    );
    if (index !== -1) {
      selectedRoutesToCompMerge.splice(index, 1);
    }
  }
}

function compareRoutes() {
  if (selectedRoutesToCompMerge.length < 2) {
    showAlert("routes", "");
  } else {
    //get the common cities
    var commonCities = [];
    var currentArrayCompare = selectedRoutesToCompMerge[0];
    var citiesToCompare = currentArrayCompare.cities;
    for (let j = 0; j < citiesToCompare.length; j++) {
      var cityToCheck = citiesToCompare[j];
      const isCityInAllRoutes = selectedRoutesToCompMerge.every((obj) =>
        obj.cities.includes(cityToCheck)
      );
      if (isCityInAllRoutes) {
        commonCities.push(cityToCheck);
      }
    }
    //get the different Cities
    var differentCitiesArray = [];
    const cityCounts = selectedRoutesToCompMerge
      .map((obj) => obj.cities)
      .flat()
      .reduce((counts, city) => {
        counts[city] = (counts[city] || 0) + 1;
        return counts;
      }, {});

    const uniqueCities = Object.keys(cityCounts).filter(
      (city) => cityCounts[city] === 1
    );
    uniqueCities.forEach((city) => {
      differentCitiesArray.push(city);
    });

    //get the common arts of activities
    var commonArtActivity = [];
    var artsToCompare = currentArrayCompare.activitiesArts;
    for (let a = 0; a < artsToCompare.length; a++) {
      var artToCheck = artsToCompare[a];
      const isArtInAllArrays = selectedRoutesToCompMerge.every((obj) =>
        obj.activitiesArts.includes(artToCheck)
      );
      if (isArtInAllArrays) {
        commonArtActivity.push(artToCheck);
      }
    }

    //get the different arts of activitites
    var differentArtActivities = [];
    const artCounts = selectedRoutesToCompMerge
      .map((obj) => obj.activitiesArts)
      .flat()
      .reduce((counts, art) => {
        counts[art] = (counts[art] || 0) + 1;
        return counts;
      }, {});
    const uniqueArts = Object.keys(artCounts).filter(
      (art) => artCounts[art] === 1
    );
    uniqueArts.forEach((art) => {
      differentArtActivities.push(art);
    });

    // create arrays to include all of the activities places
    var activitiesPlacesArray = [];
    for (let c = 0; c < selectedRoutesToCompMerge.length; c++) {
      var newArray = [];
      activitiesPlacesArray.push(newArray);
    }
    // iterate on all activities
    for (let d = 0; d < selectedRoutesToCompMerge.length; d++) {
      var currentActivities = selectedRoutesToCompMerge[d].activities;
      currentActivities.forEach((activity) => {
        activitiesPlacesArray[d].push(activity.place);
      });
    }

    //get the common Activities
    var commonActivities = [];
    var activitiesToCompare = activitiesPlacesArray[0];
    for (let b = 0; b < activitiesToCompare.length; b++) {
      var activityToCheck = activitiesToCompare[b];
      const isActivityInAllArrays = activitiesPlacesArray.every((obj) =>
        obj.includes(activityToCheck)
      );
      if (isActivityInAllArrays) {
        commonActivities.push(activityToCheck);
      }
    }
    // get the different Activities
    var differentActivitites = [];
    const activtityCounts = activitiesPlacesArray
      .map((obj) => obj)
      .flat()
      .reduce((counts, activity) => {
        counts[activity] = (counts[activity] || 0) + 1;
        return counts;
      }, {});
    const uniqueActivities = Object.keys(activtityCounts).filter(
      (activity) => activtityCounts[activity] === 1
    );
    uniqueActivities.forEach((activity) => {
      differentActivitites.push(activity);
    });

    createDifferenceTables(
      commonActivities,
      commonCities,
      commonArtActivity,
      differentActivitites,
      differentCitiesArray,
      differentArtActivities
    );
  }
}

$(document).ready(function () {
  $(document).on("click", ".compareButton1", function () {
    compareRoutes();
  });
});

function createDifferenceTables(
  commonActivities,
  commonCities,
  commonArtActivity,
  differentActivitites,
  differentCitiesArray,
  differentArtActivities
) {
  const diffTable = document.getElementById("differTable");
  const tableTitle = `<h1 class="title" style="margin-bottom: 4rem">Compared Routes</h1>`;
  // const tableTitle = `<h3 class="tableTitle">Compared Routes</h3>`;
  const tableBeginn = `<div id="compareContainer">
  <div class="tabular-data module" id="bigDiffTable">
  <div class="data-group data-header hidden-sm hidden-xs">
      <div class="row">
        <div class="col-lg-2 col-md-1">
          <strong class="uppercase">Name</strong>
        </div>
        <div class="col-lg-2 col-md-4">
          <strong class="uppercase">Blogger</strong>
        </div>
        <div class="col-lg-2 col-md-4">
          <strong class="uppercase">Duration</strong>
        </div>
        <div class="col-lg-2 col-md-4">
          <strong class="uppercase">type</strong>
        </div>
        <div class="col-lg-2 col-md-4">
          <strong class="uppercase">Price</strong>
        </div>
        <div class="col-lg-2 col-md-4">
          <strong class="uppercase">Rating</strong>
        </div>
      </div>
    </div>
  </div>
  </div>`;
  let html = tableTitle + tableBeginn;
  // diffTable.innerHTML = html;
  $("#differTable").show().html(html);

  for (let i = 0; i < selectedRoutesToCompMerge.length; i++) {
    var currentRoute = selectedRoutesToCompMerge[i];

    // <div class="col-lg-2 col-md-1 colMargin">
    var routeInfo = `<div class="data-group"><div class="row">
    <div class="data-expands row-active" id="differ-data">
      <div class="col-lg-2 col-md-1">
      <span>${currentRoute.blogger}</span>
      </div>
      <div class="col-lg-2 col-md-4">
        <span>${currentRoute.blogger}</span>
      </div>
      <div class="col-lg-2 col-md-4">
        <span>${currentRoute.duration}</span>
      </div>
      <div class="col-lg-2 col-md-4" id="compareTripType${i}">
      </div>
      <div class="col-lg-2 col-md-4">
        <span>${currentRoute.costs} <i class="fa-solid fa-euro-sign"></i> </span>
      </div>
      <div class="col-lg-2 col-md-4">
        <span>5<i class="fa-solid fa-star"></i></span>
      </div>
      </div>
    </div>
    </div>
    
  </div>`;
    $("#bigDiffTable").append(routeInfo);
  }
  var moreIcon = `<div class="row justify-content-center" id="moreButton"> 
<span>Show More <i class="fa-solid fa-plus"></i></span>
</div>`;

  $("#bigDiffTable").append(moreIcon);

  for (let a = 0; a < selectedRoutesToCompMerge.length; a++) {
    var currentType = selectedRoutesToCompMerge[a].tripType;
    switch (currentType) {
      case "Family":
        var tripTypeIconText = `<div class="green uppercase"><strong><i class="fa-solid fa-people-roof"></i> Family </strong>
      </div>`;
        $(`#compareTripType${a}`).append(tripTypeIconText);
        break;

      case "Friends":
        var tripTypeIconText = `<div class="blue uppercase"><strong><i class="fa-solid fa-user-group"></i> Friends </strong>
      </div>`;
        $(`#compareTripType${a}`).append(tripTypeIconText);
        break;

      case "Young Couple":
        var tripTypeIconText = `<div class="red uppercase"><strong><i class="fa-regular fa-face-kiss-wink-heart"></i> Young Couple </strong>
      </div>`;
        $(`#compareTripType${a}`).append(tripTypeIconText);
        break;
    }
  }

  var compareInfo = ` <div class="expandable" id="hideAble">
<div class="row">
  <div class="col-lg-8 col-lg-offset-1 col-md-7 col-md-offset-1">
    <p class="citiesInfo" id="commonCities"></p>
    <hr>
    <p class="activityArtInfo" id="commonActivityArts"></p>
    <hr>
    <p class="activitiesInfo" id="commonActivitites"></p>
    <hr>
  </div>
  <div class="col-lg-8 col-lg-offset-1 col-md-7 col-md-offset-1">
    <p class="citiesInfo" id="differentCities"></p>
    <hr>
    <p class="activityArtInfo" id="differentActivityArts"></p>
    <hr>
    <p class="activitiesInfo" id="differentActivitites"></p>
    <hr>
  </div>
  </div>
</div>
</div>`;

  $("#bigDiffTable").append(compareInfo);

  //common Cities
  var commonCitiesTitle = `<h4>Common Cities</h4>`;
  $("#commonCities").append(commonCitiesTitle);
  for (let c = 0; c < commonCities.length; c++) {
    var city = `${commonCities[c]} `;
    var arrow = `<i class="fa-solid fa-arrow-right"></i> `;
    $("#commonCities").append(city);
    if (c < commonCities.length - 1) {
      $("#commonCities").append(arrow);
    }
  }

  //Different Cities
  var differentCitiesTitle = `<h4>Unique Cities</h4>`;
  $("#differentCities").append(differentCitiesTitle);
  for (let c = 0; c < differentCitiesArray.length; c++) {
    var city = `${differentCitiesArray[c]} `;
    var arrow = `<i class="fa-solid fa-arrow-right"></i> `;
    $("#differentCities").append(city);
    if (c < differentCitiesArray.length - 1) {
      $("#differentCities").append(arrow);
    }
  }

  //common Art of Activities
  var commonArtTitle = `<h4>Common Arts of Activities:</h4>`;
  $("#commonActivityArts").append(commonArtTitle);
  for (let a = 0; a < commonArtActivity.length; a++) {
    switch (commonArtActivity[a]) {
      case "Swimming":
        var icon = `<i class="fa-solid fa-person-swimming"></i> Swimming, `;
        $("#commonActivityArts").append(icon);
        break;

      case "Nature":
        var icon = `<i class="fa-solid fa-tree"></i> Nature, `;
        $("#commonActivityArts").append(icon);
        break;

      case "City Tour":
        var icon = `<i class="fa-solid fa-city"></i> City Tour, `;
        $("#commonActivityArts").append(icon);
        break;

      case "History":
        var icon = `<i class="fa-solid fa-landmark"></i> History, `;
        $("#commonActivityArts").append(icon);
        break;

      case "Kids":
        var icon = `<i class="fa-solid fa-children"></i> Kids, `;
        $("#commonActivityArts").append(icon);
        break;

      case "Sport":
        var icon = `<i class="fa-solid fa-person-running"></i> Sport, `;
        $("#commonActivityArts").append(icon);
        break;

      case "Festival":
        var icon = `<i class="fa-solid fa-holly-berry"></i> Festival, `;
        $("#commonActivityArts").append(icon);
        break;

      case "Games":
        var icon = `<i class="fa-solid fa-gamepad"></i> Games, `;
        $("#commonActivityArts").append(icon);
        break;

      case "Romantic":
        var icon = `<i class="fa-solid fa-heart"></i> Romantic, `;
        $("#commonActivityArts").append(icon);
        break;
    }
  }

  //different Art of Activities
  var differentArtTitle = `<h4>Unique Arts of Activities:</h4>`;
  $("#differentActivityArts").append(differentArtTitle);
  for (let a = 0; a < differentArtActivities.length; a++) {
    switch (differentArtActivities[a]) {
      case "Swimming":
        var icon = `<i class="fa-solid fa-person-swimming"></i> Swimming, `;
        $("#differentActivityArts").append(icon);
        break;

      case "Nature":
        var icon = `<i class="fa-solid fa-tree"></i> Nature, `;
        $("#differentActivityArts").append(icon);
        break;

      case "City Tour":
        var icon = `<i class="fa-solid fa-city"></i> City Tour, `;
        $("#differentActivityArts").append(icon);
        break;

      case "History":
        var icon = `<i class="fa-solid fa-landmark"></i> History, `;
        $("#differentActivityArts").append(icon);
        break;

      case "Kids":
        var icon = `<i class="fa-solid fa-children"></i> Kids, `;
        $("#differentActivityArts").append(icon);
        break;

      case "Sport":
        var icon = `<i class="fa-solid fa-person-running"></i> Sport, `;
        $("#differentActivityArts").append(icon);
        break;

      case "Festival":
        var icon = `<i class="fa-solid fa-holly-berry"></i> Festival, `;
        $("#differentActivityArts").append(icon);
        break;

      case "Games":
        var icon = `<i class="fa-solid fa-gamepad"></i> Games, `;
        $("#differentActivityArts").append(icon);
        break;

      case "Romantic":
        var icon = `<i class="fa-solid fa-heart"></i> Romantic, `;
        $("#differentActivityArts").append(icon);
        break;
    }
  }

  //common Activities
  var commonActivitiesTitle = `<h4>Common Activities </h4`;
  $("#commonActivitites").append(commonActivitiesTitle);
  for (let b = 0; b < commonActivities.length; b++) {
    var theActivtiyName = commonActivities[b];
    var activityToAdd = `${theActivtiyName} `;
    var icon = `<i class="fa-solid fa-minus"></i> `;
    $("#commonActivitites").append(activityToAdd);
    if (b < commonActivities.length - 1) {
      $("#commonActivitites").append(icon);
    }
  }

  //different Activities
  var differentActivitiesTitle = `<h4>Unique Activities </h4`;
  $("#differentActivitites").append(differentActivitiesTitle);
  for (let b = 0; b < differentActivitites.length; b++) {
    var theActivtiyName = differentActivitites[b];
    var activityToAdd = `${theActivtiyName} `;
    var icon = `<i class="fa-solid fa-minus"></i> `;
    $("#differentActivitites").append(activityToAdd);
    if (b < commonActivities.length - 1) {
      $("#differentActivitites").append(icon);
    }
  }
}

// open more details
$(document).ready(function () {
  $(document).on("click", "#moreButton", function () {
    if (pressed) {
      $("#hideAble").css({
        display: "none",
      });
      var plusSign = `<span>Show More <i class="fa-solid fa-plus"></i></span>`;
      var moreButton = document.getElementById("moreButton");
      moreButton.innerHTML = plusSign;
      pressed = false;
    } else {
      $("#hideAble").css({
        display: "block",
        padding: "1rem",
      });
      var minusSign = `<span>Show Less <i class="fa-solid fa-minus"></i></span>`;
      var moreButton = document.getElementById("moreButton");
      moreButton.innerHTML = minusSign;
      pressed = true;
    }
  });
});

function mergeRoutes() {
  if (selectedRoutesToCompMerge.length < 2) {
    showAlert("routes", "");
  } else {
    // get the cities for the new route after merging:
    var mergedCitites = [];
    const newCities = selectedRoutesToCompMerge
      .map((obj) => obj.cities)
      .flat()
      .filter((city, index, arr) => arr.indexOf(city) === index);
    newCities.forEach((city) => {
      mergedCitites.push(city);
    });
    // get the ArtActivities for the new route after merging
    var mergedArtsActivities = [];
    const newArts = selectedRoutesToCompMerge
      .map((obj) => obj.activitiesArts)
      .flat()
      .filter((art, index, arr) => arr.indexOf(art) == index);
    newArts.forEach((art) => {
      mergedArtsActivities.push(art);
    });

    // create arrays to include all of the activities places
    var activitiesPlacesArray = [];
    for (let c = 0; c < selectedRoutesToCompMerge.length; c++) {
      var newArray = [];
      activitiesPlacesArray.push(newArray);
    }
    // iterate on all activities
    for (let d = 0; d < selectedRoutesToCompMerge.length; d++) {
      var currentActivities = selectedRoutesToCompMerge[d].activities;
      currentActivities.forEach((activity) => {
        activitiesPlacesArray[d].push(activity.place);
      });
    }
    // get the activities for the new route after merging
    var mergedActivities = [];
    const newActivities = activitiesPlacesArray
      .map((obj) => obj)
      .flat()
      .filter((activitiy, index, arr) => arr.indexOf(activitiy) == index);
    newActivities.forEach((activitiy) => {
      mergedActivities.push(activitiy);
    });

    // get the count of days for the new route
    var days = 0;
    selectedRoutesToCompMerge.forEach((obj) => {
      var dayCount = parseInt(obj.duration);
      days += dayCount;
    });

    days -= 3;

    // get Price for the new route
    var price = 0;
    selectedRoutesToCompMerge.forEach((obj) => {
      var toPrice = parseInt(obj.costs);
      price += toPrice;
    });

    price -= 450;

    // get the multiple types of trip for the new route
    var mergedTriptArt = [];
    selectedRoutesToCompMerge.forEach((obj) => {
      mergedTriptArt.push(obj.tripType);
    });

    // get the multiple bloggers for the new route
    var mergedBlogger = [];
    selectedRoutesToCompMerge.forEach((obj) => {
      mergedBlogger.push(obj.blogger);
    });

    createMergedTables(
      mergedCitites,
      mergedArtsActivities,
      mergedActivities,
      mergedBlogger,
      mergedTriptArt,
      price,
      days
    );
  }
}

$(document).ready(function () {
  $(document).on("click", "#mergeButton", function () {
    mergeRoutes();
  });
});

function createMergedTables(
  mergedCitites,
  mergedArtsActivities,
  mergedActivities,
  mergedBlogger,
  mergedTriptArt,
  price,
  days
) {
  const mergeTable = document.getElementById("mergedTable");
  const tableTitle = `<h1 class="title" style="margin-bottom: 4rem">Merged Routes</h1>`;
  // const tableTitle = `<h3 class="tableTitle">Merged Routes</h3>`;
  const tableBeginn = `<div  id="compareContainer">
  <div class="tabular-data module" id="bigMergeTable">
  <div class="data-group data-header hidden-sm hidden-xs">
      <div class="row">
        <div class="col-lg-2 col-md-1">
          <strong class="uppercase">Name</strong>
        </div>
        <div class="col-lg-2 col-md-4">
          <strong class="uppercase">Blogger</strong>
        </div>
        <div class="col-lg-2 col-md-4">
          <strong class="uppercase">Duration</strong>
        </div>
        <div class="col-lg-2 col-md-4">
          <strong class="uppercase">type</strong>
        </div>
        <div class="col-lg-2 col-md-4">
          <strong class="uppercase">Price</strong>
        </div>
        <div class="col-lg-2 col-md-4">
          <strong class="uppercase">Rating</strong>
        </div>
      </div>
    </div>
  </div>
  </div>`;

  let html = tableTitle + tableBeginn;
  // mergeTable.innerHTML = html;
  $("#mergedTable").show().html(html);

  for (let i = 0; i < selectedRoutesToCompMerge.length; i++) {
    var currentRoute = selectedRoutesToCompMerge[i];
    var routeInfo = `<div class="data-group"><div class="row">
    <div class="data-expands row-active" id="differ-data">
      <div class="col-lg-2 col-md-1">
      <span>${currentRoute.blogger}</span>
      </div>
      <div class="col-lg-2 col-md-4">
        <span>${currentRoute.blogger}</span>
      </div>
      <div class="col-lg-2 col-md-4">
        <span>${currentRoute.duration}</span>
      </div>
      <div class="col-lg-2 col-md-4" id="mergedTripType${i}">
      </div>
      <div class="col-lg-2 col-md-4">
        <span>${currentRoute.costs} <i class="fa-solid fa-euro-sign"></i> </span>
      </div>
      <div class="col-lg-2 col-md-4">
        <span>5<i class="fa-solid fa-star"></i></span>
      </div>
      </div>
    </div>
    </div>
    
  </div>`;
    $("#bigMergeTable").append(routeInfo);
  }
  var moreIcon = `<div class="row justify-content-center" id="mergemoreButton"> 
<span>Show More <i class="fa-solid fa-plus"></i></span>
</div>`;

  $("#bigMergeTable").append(moreIcon);

  for (let a = 0; a < selectedRoutesToCompMerge.length; a++) {
    var currentType = selectedRoutesToCompMerge[a].tripType;
    switch (currentType) {
      case "Family":
        var tripTypeIconText = `<div class="green uppercase"><strong><i class="fa-solid fa-people-roof"></i> Family </strong>
      </div>`;
        $(`#mergedTripType${a}`).append(tripTypeIconText);
        break;

      case "Friends":
        var tripTypeIconText = `<div class="blue uppercase"><strong><i class="fa-solid fa-user-group"></i> Friends </strong>
      </div>`;
        $(`#mergedTripType${a}`).append(tripTypeIconText);
        break;

      case "Young Couple":
        var tripTypeIconText = `<div class="red uppercase"><strong><i class="fa-regular fa-face-kiss-wink-heart"></i> Young Couple </strong>
      </div>`;
        $(`#mergedTripType${a}`).append(tripTypeIconText);
        break;
    }
  }

  var mergeInfo = ` <div class="expandable" id="mergeHideAble">
<div class="row">
  <div class="col-lg-8 col-lg-offset-1 col-md-7 col-md-offset-1">
    <p class="citiesInfo" id="mergeCities"></p>
    <hr>
    <p class="activityArtInfo" id="mergeActivityArts"></p>
    <hr>
    <p class="activitiesInfo" id="mergeActivitites"></p>
    <hr>
  </div>
  <div class="col-lg-8 col-lg-offset-1 col-md-7 col-md-offset-1">
    <p class="activitiesInfo" id="mergedTripType"></p>
    <hr>
    <p class="activitiesInfo" id="mergeBlogger"></p>
    <hr>
    <p class="citiesInfo" id="mergedDays"><h4>Duration</h4><span>${days}</span> Days </p>
    <hr>
    <p class="activityArtInfo" id="mergedPrice"><h4>Costs</h4><span>${price} <i class="fa-solid fa-euro-sign"></i> </span></p>
    <hr>
  </div>
  </div>
</div>
</div>`;

  $("#bigMergeTable").append(mergeInfo);

  //merged Cities
  var citiesTitle = `<h4>Cities</h4>`;
  $("#mergeCities").append(citiesTitle);
  for (let c = 0; c < mergedCitites.length; c++) {
    var city = `${mergedCitites[c]} `;
    var arrow = `<i class="fa-solid fa-arrow-right"></i> `;
    $("#mergeCities").append(city);
    if (c < mergedCitites.length - 1) {
      $("#mergeCities").append(arrow);
    }
  }

  //merged Art of Activities
  var artTitle = `<h4>Arts of Activities</h4>`;
  $("#mergeActivityArts").append(artTitle);
  for (let a = 0; a < mergedArtsActivities.length; a++) {
    switch (mergedArtsActivities[a]) {
      case "Swimming":
        var icon = `<i class="fa-solid fa-person-swimming"></i> Swimming, `;
        $("#mergeActivityArts").append(icon);
        break;

      case "Nature":
        var icon = `<i class="fa-solid fa-tree"></i> Nature, `;
        $("#mergeActivityArts").append(icon);
        break;

      case "City Tour":
        var icon = `<i class="fa-solid fa-city"></i> City Tour, `;
        $("#mergeActivityArts").append(icon);
        break;

      case "History":
        var icon = `<i class="fa-solid fa-landmark"></i> History, `;
        $("#mergeActivityArts").append(icon);
        break;

      case "Kids":
        var icon = `<i class="fa-solid fa-children"></i> Kids, `;
        $("#mergeActivityArts").append(icon);
        break;

      case "Sport":
        var icon = `<i class="fa-solid fa-person-running"></i> Sport, `;
        $("#mergeActivityArts").append(icon);
        break;

      case "Festival":
        var icon = `<i class="fa-solid fa-holly-berry"></i> Festival, `;
        $("#mergeActivityArts").append(icon);
        break;

      case "Games":
        var icon = `<i class="fa-solid fa-gamepad"></i> Games, `;
        $("#mergeActivityArts").append(icon);
        break;

      case "Romantic":
        var icon = `<i class="fa-solid fa-heart"></i> Romantic, `;
        $("#mergeActivityArts").append(icon);
        break;
    }
  }

  //merged Activities
  var activitiesTitle = `<h4>Activities</h4`;
  $("#mergeActivitites").append(activitiesTitle);
  for (let b = 0; b < mergedActivities.length; b++) {
    var theActivtiyName = mergedActivities[b];
    var activityToAdd = `${theActivtiyName} `;
    var icon = `<i class="fa-solid fa-minus"></i> `;
    $("#mergeActivitites").append(activityToAdd);
    if (b < mergedActivities.length - 1) {
      $("#mergeActivitites").append(icon);
    }
  }

  //merged trip Type
  var tripArtTitle = `<h4>Trip Art</h4`;
  $("#mergedTripType").append(tripArtTitle);
  for (let a = 0; a < mergedTriptArt.length; a++) {
    var currentType = mergedTriptArt[a];
    switch (currentType) {
      case "Family":
        if (a < mergedTriptArt.length - 1) {
          var tripTypeIconText = `<div class="green uppercase"><strong><i class="fa-solid fa-people-roof"></i> Family, </strong>
          </div>`;
          $("#mergedTripType").append(tripTypeIconText);
          break;
        } else {
          var tripTypeIconText = `<div class="green uppercase"><strong><i class="fa-solid fa-people-roof"></i> Family </strong>
        </div>`;
          $("#mergedTripType").append(tripTypeIconText);
          break;
        }

      case "Friends":
        if (a < mergedTriptArt.length - 1) {
          var tripTypeIconText = `<div class="blue uppercase"><strong><i class="fa-solid fa-user-group"></i> Friends, </strong>
        </div>`;
          $("#mergedTripType").append(tripTypeIconText);
          break;
        } else {
          var tripTypeIconText = `<div class="blue uppercase"><strong><i class="fa-solid fa-user-group"></i> Friends </strong>
        </div>`;
          $("#mergedTripType").append(tripTypeIconText);
          break;
        }

      case "Young Couple":
        if (a < mergedTriptArt.length - 1) {
          var tripTypeIconText = `<div class="red uppercase"><strong><i class="fa-regular fa-face-kiss-wink-heart"></i> Young Couple, </strong>
        </div>`;
          $("#mergedTripType").append(tripTypeIconText);
          break;
        } else {
          var tripTypeIconText = `<div class="red uppercase"><strong><i class="fa-regular fa-face-kiss-wink-heart"></i> Young Couple </strong>
        </div>`;
          $("#mergedTripType").append(tripTypeIconText);
          break;
        }
    }
  }

  //merged Blogger
  var bloggerTitle = `<h4>Bloggers</h4`;
  $("#mergeBlogger").append(bloggerTitle);
  for (let bl = 0; bl < mergedBlogger.length; bl++) {
    var blogger = `${mergedBlogger[bl]} `;
    var minus = `<i class="fa-solid fa-minus"></i> `;
    $("#mergeBlogger").append(blogger);
    if (bl < mergedBlogger.length - 1) {
      $("#mergeBlogger").append(minus);
    }
  }
}

// open more details for merged route
$(document).ready(function () {
  $(document).on("click", "#mergemoreButton", function () {
    if (mergedPressed) {
      $("#mergeHideAble").css({
        display: "none",
      });
      var plusSign = `<span>Show More <i class="fa-solid fa-plus"></i></span>`;
      var moreButton = document.getElementById("mergemoreButton");
      moreButton.innerHTML = plusSign;
      mergedPressed = false;
    } else {
      $("#mergeHideAble").css({
        display: "block",
        padding: "1rem",
      });
      var minusSign = `<span>Show Less <i class="fa-solid fa-minus"></i></span>`;
      var moreButton = document.getElementById("mergemoreButton");
      moreButton.innerHTML = minusSign;
      mergedPressed = true;
    }
  });

  $(".modalClose").on("click", function () {
    $(".modal").hide();
  });
});

function showAlert(alert, activityName) {
  switch (alert) {
    case "routes":
      $(".modal-title-text").html("Select Routes");
      $(".modal-text").html("Please select at least 2 routes");
      break;

    case "time":
      $(".modal-title-text").html("No time To add this activity!");
      $(".modal-text").html(`No Time to add ${activityName}?`);
      break;
  }
  $(".modal").css({ display: "flex" });
  $(".modalClose").on("click", function () {
    $(".modal").css({ display: "none" });
  });
}
