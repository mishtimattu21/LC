import cheerio from 'cheerio';

export async function fetchLeetcodeSolution(problemId) {
  try {
    const response = await fetch(`https://leetcode.ca/all/${problemId}.html`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    // ✅ Extract from <title>
    let title = $('title').text().trim(); // Example: "Leetcode Problem #1 - Two Sum"

    // Optionally clean title
    title = title.replace(/Leetcode Problem\s*#?\s*/i, 'LeetCode #');

    // 📝 Extract description between <h1> and <pre>
    const problemDescription = $('h1').nextUntil('pre').text().trim();

    // ✅ Entire HTML (for debug or future use)
    const contentHtml = $('body').html();

    // 🏢 Company extraction
    const companies = [];
    $('strong:contains("Companies")')
      .next('span')
      .text()
      .split(',')
      .forEach(c => companies.push(c.trim()));

    return {
      id: problemId,
      title: title || `LeetCode #${problemId}`,
      description: problemDescription || 'No description available',
      content: contentHtml || 'No solution content found.',
      companies,
      linkedSolution: `https://leetcode.ca/all/${problemId}.html`
    };
  } catch (error) {
    console.error(`Error fetching solution ${problemId}:`, error);
    return {
      id: problemId,
      title: `LeetCode #${problemId}`,
      description: `Error loading solution`,
      content: `Failed to load solution content: ${error.message}`,
    };
  }
}
