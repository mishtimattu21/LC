// /src/services/leetcodeService.js

export async function fetchLeetcodeSolution(problemId) {
  try {
    const response = await fetch(`http://localhost:5000/api/solution/${problemId}`);
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();

    // Convert solution object to readable content string
    const solutionText = Object.entries(data.solutions || {})
      .map(([lang, code]) => `// ${lang}\n${code}`)
      .join('\n\n');

    return {
      id: problemId,
      title: data.title || `LeetCode #${problemId}`,
      description: data.description || 'No description available',
      content: solutionText || 'No solution content found.',
      companies: data.companies || [],
      linkedSolution: data.linkedSolution || '',
    };

  } catch (error) {
    console.error(`❌ Error fetching solution ${problemId}:`, error.message);

    return {
      id: problemId,
      title: `LeetCode #${problemId}`,
      description: 'Error loading solution',
      content: `Failed to load solution content: ${error.message}`,
      companies: [],
      linkedSolution: '',
    };
  }
}
