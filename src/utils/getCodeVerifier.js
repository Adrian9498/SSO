const getCodeVerifier = (authVerificationString) => {
    let startIndex = authVerificationString.indexOf('{');
    let endIndex = authVerificationString.lastIndexOf('}');
    
    let jsonSubstring = authVerificationString.substring(startIndex, endIndex + 1);
    

    let jsonObject = JSON.parse(jsonSubstring);
    

    let codeVerifier = jsonObject.code_verifier;

    return codeVerifier
}

export default getCodeVerifier