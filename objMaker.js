import fs from 'fs';

const string = "Automotives & Auto Components Manufacturing,Functional,Global Supply Chain Optimization in Automotive,10,Personal,42;Automotives & Auto Components Manufacturing,Functional,Automotive Market Intelligence & Consumer Insights,10,Personal,39;Automotives & Auto Components Manufacturing,Functional,Advanced Automotive Product Lifecycle Management,10,Personal,27;Automotives & Auto Components Manufacturing,Technical,Autonomust driving system,10,Personal,60;Automotives & Auto Components Manufacturing,Technical,Autonomust driving system,10,Personal,32;Automotives & Auto Components Manufacturing,Technical,Autonomust driving system,10,Personal,62;Food & Beverages - FMCG/ Staples,Functional,Global Supply Chain Optimization in Automotive,10,Personal,87;Food & Beverages - FMCG/ Staples,Functional,Global Supply Chain Optimization in Automotive,10,Personal,91;Food & Beverages - FMCG/ Staples,Functional,Global Supply Chain Optimization in Automotive,10,Personal,10;Food & Beverages - FMCG/ Staples,Technical,Autonomust driving system,10,Personal,54;Food & Beverages - FMCG/ Staples,Technical,Autonomust driving system,10,Personal,74;Food & Beverages - FMCG/ Staples,Technical,Autonomust driving system,10,Personal,98;Food & Beverages - FMCG/ Staples,Technical,Autonomust driving system,10,Personal,67";

// Process the data
const finalObj = string.split(';').reduce((acc, card) => {
    const [industry, category, name, credits, mode, cost] = card.split(',');
    
    // Create nested structure using object shorthand
    acc[industry] = acc[industry] || {};
    acc[industry][category] = acc[industry][category] || [];
    
    // Push the category object
    acc[industry][category].push([name, credits, mode, cost]);
    
    return acc;
}, {});

// Write to JSON file
try {
    fs.writeFileSync('output.json', JSON.stringify(finalObj, null, 2));
    console.log('Data successfully written to output.json');
} catch (err) {
    console.error('Error writing to file:', err);
}

// Optional: Log the object to console
console.log(finalObj);