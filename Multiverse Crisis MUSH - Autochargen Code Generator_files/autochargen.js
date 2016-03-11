// Global variables, mostly HTML objects for later use.  startup() fills
// most of these.

var formName, formPassword, formTheme, 
	formFaction, formFunction, formRank,
	formRankTitle, formQuote, formProfile, formPowers,
	formFlaws, formPL, out, navalBox, formDebugMode, formCharType;





// This is for the quotation marks used in the "quote" string.
// Switch to something else if desired (hence why a normal double-quote
// and a blank string are in there as 'defaults' to switch between).

var quote = "\"";
//var quote = "";





// A quote to put around the name variable.

//var nameQuote = "\"";
var nameQuote="";




// This is set up so that whenever we need to check
// the character name, we can just look at this variable.
// refreshName() refreshes this and inserts the appropriate
// quotes in the code.

var charName;





// Refresh the character name value.

function refreshName()
{
	charName = nameQuote + formName.value + nameQuote;
}





// Recode the incoming string for MUSHCode with some
// search-and-replace for common 'problem' characters.

function mushCode(input)
{
	var output;
	
	
	// Percentage marks.
	output = input.replace(/\%/g, "%%");

	// Forward slashes.
	output = output.replace(/\\/g, "\\\\");
	
	// Square brackets.
	output = output.replace(/\[/g, "\\[");
	output = output.replace(/\]/g, "\\]");

	// Newline characters.
	output = output.replace(/\n/g, "%r");
	output = output.replace(/\r/g, "");  // This is for Opera's bitching.

	// Tabs.
	output = output.replace(/\t/g, "%t");
		
	return output;
}





// The startup function.  This gets handles to the objects that we'll be
// working with.  For efficiency and neater code, it just does this all at
// once and refers to the objects later.

function startup()
{
	formName = document.getElementById("charname");
	formPassword = document.getElementById("password");
	formTheme = document.getElementById("theme");
	formFaction = document.getElementById("faction");
	formFunction = document.getElementById("function");
	formRank = document.getElementById("rank");
	formQuote = document.getElementById("quote");
	formProfile = document.getElementById("profile");
	formPowers = document.getElementById("powers");
	formFlaws = document.getElementById("flaws");
	formPL = document.getElementById("pl");
	navalBox = document.getElementById("navalBox");
	out = document.getElementById("resultCode");
	formDebugMode = document.getElementById("debugModeBox");
	formCharType = document.getElementById("chartype");
}





// Match rank to title.

// 06-12-11 - now updated for new rank structure.

function rankTitle(rank, naval)
{
	var retval;
	switch (rank) {
		case '0':
			retval = "Enlisted";
			break;
		case '1':
			retval = "Ensign";
			break;
		case '2':
			retval = "Lieutenant";
			break;
		case '3':
			retval = (naval ? "Lt. Commander" : "Field Captain");
			break;
		case '4':
			retval = (naval ? "Major" : "Commander");
			break;
		case '5':
			retval = (naval ? "Captain" : "Colonel");
			break;
		case '6':
			retval = (naval ? "Admiral" : "General");
			break;
		case '7':
			retval = "Field Marshal";
			break;
		case '8':
			retval = "High Constable";
			break;
		case '9':
			retval = "Commander-in-Chief";
			break;
		case 'PA':
			retval = "Provisional Ally";
			break;
		case 'A':
			retval = "Ally";
			break;
		case 'SA':
			retval = 'Senior Ally';
			break;
		case 'W':
			retval = "Wraith";
			break;
		case 'LC':
			retval = "Last Chancer";
			break;
		case "U":
			retval = "Union Citizen";
			break;
		case "C":
			retval = "Confederate Citizen";
			break;
		case "X":
			retval = "None";
			break;
		default:			// This should never happen
			retval = "N/A";
			break;
	}
	return retval;
}





// Puts together commands in the typical +set-blah way.  Input is an object.

function command(title, source)
{
	var retval;
	retval = "+set" + title + " " + charName + 
		"=" + source.value + "\n";
	return retval;
}





// Puts together commands in the typical +set-blah way and rewrites them for MUSHCode.
// Input is an object.

function commandRecode(title, source)
{
	var retval;
	retval = "+set" + title + " " + charName +
		"=" + mushCode(source.value) + "\n";
	return retval;
}





// Puts together commands in the typical +set-blah way.
// Input is a string.
// recode is a flag to determine whether or not to rewrite the string in MUSHCode.

function commandRawString(title, source, recode)
{
	var retval;
	retval = "+set" + title + " " + charName +
		"=" + (recode ? mushCode(source) : source) + "\n";
	return retval;
}





// Check to see if a string is empty or null.

function isEmpty(st)
{
	return (st == null || (/^\s*$/).test(st));
}





// Check to see if the value of an object is empty or null.

function isEmptyObject(obj)
{
	return isEmpty(obj.value);
}

function isDebugMode()
{
	return (formDebugMode.checked);
}





// The main function.  This first determines whether or not there are any warnings.
// If there are, display.  If not, produce chargen code.

function newProcessForm()
{
	var output, scratch, isNaval, warnings;

	// Check warnings, unless we're in debug mode, in which case, screw 'em.

	if (isDebugMode()) {
		warnings = null;
	}
	else {
		warnings = checkWarnings();
	}

	if (warnings == null) {
	
		// The character name may have changed, so refresh it.
		refreshName();

		isNaval = navalBox.checked;
		
		scratch = "@pcreate " + charName + 
			"=" + formPassword.value + "\n";
	
		output = scratch;
		output += command("series", formTheme);
		output += command("faction", formFaction);
		output += command("function", formFunction);
		
		output += commandRawString("quote", quote + formQuote.value + quote, true);
		output += commandRawString("rank", formRank.value + " " + rankTitle(formRank.value, isNaval), false);

		output += command("level", formPL);	
		output += commandRecode("profile", formProfile);
		output += commandRecode("powers", formPowers);
		output += commandRecode("flaws", formFlaws);
		output += "+chartype " + charName + "=" + formCharType.value + "\n";

		out.value = output;
	}
	else {
		alert(warnings);
	}
}





// This function checks for various problems that may crop up.  Note that it is impossible to get
// a blank rank, so that is not directly checked for, and it is also impossible to get a blank faction,
// so that is not directly checked for.  However, faction/rank conflicts ARE checked for in a very 
// limited fashion.

function checkWarnings()
{
	var retval, scratch, numProbs = 0;
		
	scratch = "The following problems have been found:\n";
	
	// Initial chargen problems.
	
	if (isEmptyObject(formName)) {
		scratch += "No character name.\n";
		numProbs++;
	}
	if (isEmptyObject(formPassword)) {
		scratch += "Password is empty.\n";
		numProbs++;
	}
	
	// Short character data problems.
	
	if (isEmptyObject(formFunction)) {
		scratch += "Function is empty.\n";
		numProbs++;
	}
	if (isEmptyObject(formQuote)) {
		scratch += "Quote is empty.\n"
		numProbs++;
	};
	if (isEmptyObject(formTheme)) {
		scratch += "Theme is empty.\n";
		numProbs++;
	}
	
	// Long character data problems.
	
	if (isEmptyObject(formProfile)) {
		scratch += "Profile is empty.\n";
		numProbs++;
	}
	if (isEmptyObject(formPowers)) {
		scratch += "Powers is empty.\n";
		numProbs++;
	}
	if (isEmptyObject(formFlaws)) {
		scratch += "Flaws is empty.\n";
		numProbs++;
	}
	
	// PL problems.
	
	if (isEmptyObject(formPL)) {
		scratch += "Power level is empty.\n";
		numProbs++;
	}
	else if (!formPL.value.match(/^\d+$/)) {
		scratch += "Power level must be a positive integer or 0.\n";
		numProbs++;
	}
	
	// Rank/faction conflict problems.
	
	if (formFaction.value == "Confederate" && formRank.value == "LC") {
		scratch += "A Confederate cannot be a Last Chancer.\n";
		numProbs++;
	}
	if (formFaction.value == "Union" && formRank.value == "W") {
		scratch += "A Union member cannot be a Wraith.\n";
		numProbs++;
	}
	
	// Whine if we have problems, return null if we don't.
	
	if (numProbs > 0) {
		retval = scratch + "\n\nTotal problems: " + numProbs;
	}
	else {
		retval = null;
	}
	
	return retval;
}





// Wrapper function for potential new versions of processForm, though it's unlikely
// this will be used, and will probably be deleted (and newProcessForm renamed processForm)
// in the final version.

function processForm()
{
	newProcessForm();
}
