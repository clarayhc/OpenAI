import { promptGPT } from "../shared/openai.ts";
import { ask, say } from "../shared/cli.ts";

// Initialize an empty array for storing weddings

say("Welcome to your AI wedding planner.");


const response = await ask("Start a new playlist? Type y to start a new playlist, type n to view existing playlists");

if (response.toLowerCase() === "y") await createWedding();
else if (response.toLowerCase() === "n") await getPlaylists();

async function createWedding() {
  let weddings = await fetchPlaylists()
  const theme = await ask("What theme will your wedding have? (ex) fun, serious, casual, etc.");
  const couple = await ask("Couple's names?");
  const type = await ask("What type of music do you prefer? (ex) classical, pop, jazz, etc. ");
  const lyric = await ask("Would you like the music to have lyrics?");
  
  const response = await promptGPT(
    `Plan a wedding song playlist with the theme ${theme}, with genre ${type}, with ${lyric} lyrics. You must respond 
    in a JSON object only with the following format {"playlist": [{"title": string, "artist": string}]}`,
    { temperature: 0.8 , response_format: {"type": "json_object" }},
    
  );
  
  const playlist = JSON.parse(response);
  say(`Wedding playlist for ${couple} created!`);
  await savePlaylist(weddings.length+1, playlist)
}

async function getPlaylists(){
  const savedPlaylists = await fetchPlaylists();
  savedPlaylists.forEach((playlist, i) => {
    const list = playlist["playlist"]
    say(`Here is playlist #${i + 1}`)
    list.forEach((song, j)=>{
      say(`${j + 1}. ${song['title']} by ${song['artist']}`)
    })
    say("\n")
  })
}


async function getStatus() {
  const text = await Deno.readTextFile("status.txt")
  const playlistNumber = parseInt(text)
  return playlistNumber
}

async function savePlaylist(playlistNumber, playlist) {
  await Deno.writeTextFile(`./playlists/${playlistNumber}.json`, JSON.stringify(playlist));
  await Deno.writeTextFile(`status.txt`, playlistNumber)
}

async function fetchPlaylists() {
  const playlistNumber = await getStatus()
  let pNums = []
  for (let i = 0; i <= playlistNumber; i++){
    pNums.push(i)
  }
 
  const playlists = await Promise.all(pNums.map(async (i) => {
    const text = await Deno.readTextFile(`./playlists/${i}.json`);
    const obj = JSON.parse(text);

    return obj;
  }));
  
  return playlists
}


// async function editWedding() {
//   if (weddings.length === 0) {
//     say("No weddings to edit.");
//     return;
//   }

//   weddings.forEach((wedding, index) => say(`${index + 1}: ${wedding.title}`));
//   const index = parseInt(await ask("Which wedding would you like to edit? (Enter number)")) - 1;
//   if (index < 0 || index >= weddings.length) {
//     return say("Invalid selection.");
//   }

//   const changes = await ask("What would you like to change or add?");
//   const updatedDescription = await promptGPT(
//     `Continue planning a wedding for ${weddings[index].couple}. Incorporate the following changes: ${changes}. Update the wedding description.`,
//     { temperature: 0.8, max_tokens: 500 }
//   );

//   weddings[index].description += `\n${updatedDescription}`;
//   say(`The wedding plan for ${weddings[index].couple} has been updated!`);
// }