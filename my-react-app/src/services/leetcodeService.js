// src/services/leetcodeService.js
export async function fetchLeetcodeSolution(problemId) {
  try {
    // Note: You'll likely need a proxy due to CORS issues (see below)
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // Temporary solution
    const targetUrl = `https://leetcode.ca/${problemId}`;
    
    const response = await fetch(proxyUrl + targetUrl, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest' // Some proxies require this
      }
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // IMPORTANT: Inspect leetcode.ca to find the correct selector
    const solutionContent = doc.querySelector('.solution-content')?.innerHTML || 
                          doc.querySelector('.content__2ebE')?.innerHTML || // Example alternative
                          'Solution content not available';
    
    return {
      id: problemId,
      title: `LeetCode #${problemId}`,
      description: `Solution for problem ${problemId}`,
      content: solutionContent
    };
  } catch (error) {
    console.error(`Error fetching solution ${problemId}:`, error);
    return {
      id: problemId,
      title: `LeetCode #${problemId}`,
      description: `Error loading solution`,
      content: `Failed to load solution content: ${error.message}`
    };
  }
}