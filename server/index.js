const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.get('/api/solution/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const url = `https://leetcode.ca/all/${id}.html`;
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      const pageTitle = $('title').text().trim();
      const solutions = {};
      let currentLang = '';
      let codeBuffer = [];
      
  
      $('h3').each((i, el) => {
        const lang = $(el).text().trim();
        const pre = $(el).next('pre');
  
        if (pre.length) {
          solutions[lang] = pre.text().trim();
        }
      });
  
      // 🆕 Extract title from the <title> tag
      
      // 🆕 Extract description — all text between <h1> and the next <pre>
      const h1 = $('h1').first();
      let description = '';
      let next = h1.next();
      while (next.length && next[0].tagName !== 'pre') {
        description += next.text().trim() + '\n';
        next = next.next();
      }
      description = description.trim();
  
      // Extract company tags
      const companies = [];
      $('h3:contains("Company:")')
        .nextAll('span')
        .find('a')
        .each((_, el) => {
          companies.push($(el).text().trim());
        });
  
      // Extract linked code solution
      let linkedSolution = null;
      $('h3:contains("Problem Solution")')
        .next('a')
        .each((_, el) => {
          linkedSolution = $(el).attr('href');
        });
  
      res.json({
        solutions,
        companies,
        linkedSolution,
        title: pageTitle || `LeetCode #${id}`,
        description: description || 'No description available',
      });
  
    } catch (error) {
      console.error('Error fetching solution:', error.message);
      res.status(500).json({ error: 'Failed to fetch solution' });
    }
  });
  
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
