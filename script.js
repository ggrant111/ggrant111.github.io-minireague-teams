document.addEventListener("DOMContentLoaded", function () {
  fetch("https://statsapi.mlb.com/api/v1/teams")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const teams = data.teams;
      const mlbTeams = teams.filter((team) => team.sport.id === 1);
      const minorLeagueTeams = teams.filter((team) => team.sport.id !== 1);
      createTeamCards(mlbTeams, minorLeagueTeams);
    });

  // Close button for the main modal
  const closeButton = document.getElementsByClassName("close")[0];
  closeButton.onclick = function () {
    closeModal();
  };

  // Close the main modal when clicking outside of it
  const modal = document.getElementById("team-details");
  window.onclick = function (event) {
    if (event.target == modal) {
      closeModal();
    }
  };
});

function createTeamCards(majorLeagueTeams, minorLeagueTeams) {
  const container = document.getElementById("teams-container");
  container.innerHTML = ""; // Clear previous content

  // URLs for league logos
  const nationalLeagueLogo =
    "https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/MLB_National_League_logo.svg/200px-MLB_National_League_logo.svg.png";
  const americanLeagueLogo =
    "https://upload.wikimedia.org/wikipedia/en/thumb/5/54/American_League_logo.svg/200px-American_League_logo.svg.png";

  // Group teams by league and division
  const teamsByLeague = majorLeagueTeams.reduce((leagueGroups, team) => {
    const leagueName = team.league.name; // Assuming 'league' property has a 'name' field
    const divisionName = team.division.name; // Assuming 'division' property has a 'name' field
    leagueGroups[leagueName] = leagueGroups[leagueName] || {};
    leagueGroups[leagueName][divisionName] =
      leagueGroups[leagueName][divisionName] || [];
    leagueGroups[leagueName][divisionName].push(team);
    return leagueGroups;
  }, {});

  // Create cards for each league and division
  for (const league in teamsByLeague) {
    const leagueDiv = document.createElement("div");
    leagueDiv.classList.add("league-group");

    // Determine and set the league logo
    const leagueLogoUrl =
      league === "National League" ? nationalLeagueLogo : americanLeagueLogo;
    leagueDiv.innerHTML = `<img src="${leagueLogoUrl}" alt="${league} logo" class="league-logo"><h2>${league}</h2>`;

    for (const division in teamsByLeague[league]) {
      const divisionDiv = document.createElement("div");
      divisionDiv.classList.add("division-group");
      divisionDiv.innerHTML = `<h3>${division}</h3>`;

      teamsByLeague[league][division].forEach((team) => {
        const teamCard = document.createElement("div");
        teamCard.classList.add("team-card");
        teamCard.innerHTML = `<img src="https://www.mlbstatic.com/team-logos/${team.id}.svg" alt="${team.name} logo" class="team-logo"><div>${team.name}</div>`;
        teamCard.onclick = () => showTeamDetails(team, minorLeagueTeams);
        divisionDiv.appendChild(teamCard);
      });

      leagueDiv.appendChild(divisionDiv);
    }

    container.appendChild(leagueDiv);
  }
}

function showTeamDetails(team, minorLeagueTeams) {
  const modal = document.getElementById("team-details");
  document.getElementById("parent-team-name").textContent = team.name;

  const teamLogo = document.getElementById("parent-team-logo");
  teamLogo.src = `https://www.mlbstatic.com/team-logos/${team.id}.svg`;
  teamLogo.alt = `${team.name} logo`;

  // Fallback image URL
  const fallbackImageUrl =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTskW_v43C_6Wk1cdNTTROv7zZ3FClrBR3oqV7HeBvvz8FQT3k8OyCChe87l2kQOoEVFSE&usqp=CAU";

  // Set the fallback image if the original logo fails to load
  teamLogo.onerror = () => {
    teamLogo.src = fallbackImageUrl;
  };

  const affiliatesContainer = document.getElementById("affiliates-container");
  affiliatesContainer.innerHTML = ""; // Clear previous data

  // Fetch affiliates for the selected team
  fetch(`https://statsapi.mlb.com/api/v1/teams/${team.id}/affiliates`)
    .then((response) => response.json())
    .then((data) => {
      if (data.teams && data.teams.length > 0) {
        data.teams.forEach((affiliate) => {
          const affiliateDiv = document.createElement("div");
          affiliateDiv.classList.add("affiliate");

          const affiliateLogo = document.createElement("img");
          affiliateLogo.src = `https://www.mlbstatic.com/team-logos/${affiliate.id}.svg`;
          affiliateLogo.alt = `${affiliate.name} logo`;
          affiliateLogo.classList.add("affiliate-logo");

          // Set the fallback image for affiliate logos
          affiliateLogo.onerror = () => {
            affiliateLogo.src = fallbackImageUrl;
          };

          const affiliateName = document.createElement("div");
          affiliateName.textContent = affiliate.name;
          affiliateName.classList.add("affiliate-name");

          affiliateDiv.appendChild(affiliateLogo);
          affiliateDiv.appendChild(affiliateName);
          affiliatesContainer.appendChild(affiliateDiv);
          affiliateDiv.onclick = () => showAffiliateDetails(affiliate.id);
        });
      } else {
        affiliatesContainer.textContent = "No affiliates available";
      }
    })
    .catch((error) => {
      console.error("Error fetching affiliates:", error);
      affiliatesContainer.textContent = "Error loading affiliates";
    });

  modal.style.display = "block";
}

function showAffiliateDetails(affiliateId) {
    document.getElementById("alumni-list").innerHTML = '';
  fetch(`https://statsapi.mlb.com/api/v1/teams/${affiliateId}`)
    .then((response) => response.json())
    .then((data) => {
      const affiliateData = data.teams[0]; // Assuming the first item is the team data

      // Set the team name and logo
      document.getElementById("affiliate-team-name").textContent =
        affiliateData.name;
      document.getElementById(
        "affiliate-team-logo"
      ).src = `https://www.mlbstatic.com/team-logos/${affiliateData.id}.svg`;

      // Displaying selected information in a structured format
      const affiliateInfo = document.getElementById("affiliate-info");
      affiliateInfo.innerHTML = `
                <p><strong>Location:</strong> ${affiliateData.locationName}</p>
                <p><strong>First Year of Play:</strong> ${affiliateData.firstYearOfPlay}</p>
                <p><strong>League:</strong> ${affiliateData.league.name}</p>
                <p><strong>Division:</strong> ${affiliateData.division.name}</p>
                <p><strong>Venue:</strong> ${affiliateData.venue.name}</p>
            `;

      document.getElementById("affiliate-details").style.display = "block";
      populateSeasonDropdown(affiliateData.firstYearOfPlay);
    
    })
    .catch((error) => {
      console.error("Error fetching affiliate details:", error);
      document.getElementById("affiliate-info").textContent =
        "Error loading affiliate details";
    });
  document.getElementById("load-alumni").onclick = () => {
    const selectedSeason = document.getElementById("season-select").value;
    fetchAlumni(affiliateId, selectedSeason);
  };

  // Close button for the new modal
  document.getElementById("affiliate-close").onclick = function () {
    document.getElementById("affiliate-details").style.display = "none";
  };
}

function closeModal() {
  const modal = document.getElementById("team-details");
  modal.style.display = "none";
}

function fetchAlumni(teamId, season) {
    const alumniList = document.getElementById("alumni-list");
    alumniList.innerHTML = "Loading alumni...";

    fetch(`https://statsapi.mlb.com/api/v1/teams/${teamId}/alumni?season=${season}`)
        .then((response) => response.json())
        .then((data) => {
            alumniList.innerHTML = ""; // Clear previous content

            if (data.people && data.people.length > 0) {
                data.people.forEach((alumnus) => {
                    // Creating a div element for each alumnus
                    const alumnusDiv = document.createElement("div");
                    alumnusDiv.classList.add("alumnus-details");

                    // Headshot image URL
                    const headshotUrl = `https://img.mlbstatic.com/mlb-photos/image/upload/w_62,d_people:generic:headshot:silo:current.png,q_auto:best,f_auto/v1/people/${alumnus.id}/headshot/83/current`;

                    // Adding structured information about the alumnus
                    alumnusDiv.innerHTML = `
                        <div class="playerHeadshot"><img src="${headshotUrl}" alt="Headshot of ${alumnus.fullName}" class="alumnus-headshot"></div>
                        <div class="playerDetails">
                        <p><strong>${alumnus.fullName}</strong></p>
                        <p><strong>${alumnus.primaryPosition.name}</strong></p>
                        <p><strong>Born:</strong> ${alumnus.birthDate} in ${alumnus.birthCity}, ${alumnus.birthCountry}</p>
                        <p><strong>Drafted:</strong> ${alumnus.draftYear}</p><p><strong>Debut:</strong> ${alumnus.mlbDebutDate}</p>
                        <p><strong>Last Season:</strong> ${alumnus.alumniLastSeason}</p>
                        <p><strong>Height/Weight:</strong> ${alumnus.height} / ${alumnus.weight} lbs</p>
                        <p><strong>Bats/Throws:</strong> ${alumnus.batSide.description} / ${alumnus.pitchHand.description}</p>
                        </div>
                    `;

          // Append the alumnus div to the alumni list
          alumniList.appendChild(alumnusDiv);
        });
      } else {
        alumniList.textContent = "No alumni data available for this season.";
      }
    })
    .catch((error) => {
      console.error("Error fetching alumni:", error);
      alumniList.textContent = "Error loading alumni";
    });
}


function populateSeasonDropdown(firstYearOfPlay) {
    const seasonSelect = document.getElementById("season-select");
    seasonSelect.innerHTML = ''; // Clear existing options

    const currentYear = new Date().getFullYear();
    for (let year = firstYearOfPlay; year <= currentYear; year++) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        seasonSelect.appendChild(option);
    }
}

populateSeasonDropdown().thenReturn;
