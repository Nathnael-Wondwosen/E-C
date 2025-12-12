import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const CategoryMap = ({ categories, onCategorySelect, onCategoryEdit }) => {
  const svgRef = useRef();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Update dimensions when container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const container = svgRef.current.parentElement;
        setDimensions({
          width: container.clientWidth,
          height: Math.max(500, window.innerHeight - 300)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Render the category hierarchy visualization
  useEffect(() => {
    if (!categories || categories.length === 0) return;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .attr("viewBox", [0, 0, dimensions.width, dimensions.height]);

    // Create simulation for force-directed graph
    const nodes = categories.map(category => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
      count: category.count,
      parentId: category.parentId,
      level: getCategoryLevel(category, categories),
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height
    }));

    // Create links between parent and child categories
    const links = categories
      .filter(category => category.parentId)
      .map(category => ({
        source: category.parentId,
        target: category.id
      }));

    // Create force simulation with improved physics
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(150).strength(0.8))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force("collision", d3.forceCollide().radius(d => 40 + Math.log(d.count + 1) * 8));

    // Draw links with gradient effect
    const link = svg.append("g")
      .attr("stroke", "url(#linkGradient)")
      .attr("stroke-opacity", 0.7)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)");

    // Add gradients and markers for links
    const defs = svg.append("defs");
    
    // Gradient for links
    const gradient = defs.append("linearGradient")
      .attr("id", "linkGradient")
      .attr("gradientUnits", "userSpaceOnUse");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#94a3b8");
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#64748b");

    // Arrowhead marker
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M 0,-5 L 10,0 L 0,5")
      .attr("fill", "#94a3b8")
      .attr("stroke", "none");

    // Draw nodes with enhanced styling
    const node = svg.append("g")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation))
      .on("click", (event, d) => {
        setSelectedCategory(d);
        if (onCategorySelect) onCategorySelect(d);
      });

    // Add glow effect for selected nodes
    defs.append("filter")
      .attr("id", "glow")
      .append("feGaussianBlur")
      .attr("stdDeviation", "3.5")
      .attr("result", "coloredBlur");

    const feMerge = defs.select("#glow")
      .append("feMerge");

    feMerge.append("feMergeNode")
      .attr("in", "coloredBlur");
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");

    // Add circles for nodes with enhanced styling
    node.append("circle")
      .attr("r", d => 30 + Math.log(d.count + 1) * 6)
      .attr("fill", d => getColorByLevel(d.level))
      .attr("class", "cursor-pointer transition-all duration-200")
      .attr("style", d => selectedCategory && selectedCategory.id === d.id ? "filter: url(#glow);" : "");

    // Add icons/text to nodes with improved layout
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.3em")
      .attr("font-size", "20px")
      .attr("font-weight", "bold")
      .attr("fill", "#ffffff")
      .attr("pointer-events", "none")
      .text(d => d.icon);

    // Split long names into multiple lines
    node.each(function(d) {
      const node = d3.select(this);
      const words = d.name.split(' ');
      const maxLength = 12;
      
      if (d.name.length <= maxLength) {
        node.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "1.4em")
          .attr("font-size", "12px")
          .attr("font-weight", "600")
          .attr("fill", "#ffffff")
          .attr("pointer-events", "none")
          .text(d.name);
      } else if (words.length === 1) {
        const name = d.name.length > maxLength ? d.name.substring(0, maxLength) + "..." : d.name;
        node.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "1.4em")
          .attr("font-size", "12px")
          .attr("font-weight", "600")
          .attr("fill", "#ffffff")
          .attr("pointer-events", "none")
          .text(name);
      } else {
        // Split into two lines
        let line1 = "";
        let line2 = "";
        
        for (let i = 0; i < words.length; i++) {
          if ((line1 + words[i]).length <= maxLength) {
            line1 += (line1 ? " " : "") + words[i];
          } else {
            line2 += (line2 ? " " : "") + words[i];
          }
        }
        
        line1 = line1.length > maxLength ? line1.substring(0, maxLength) + "..." : line1;
        line2 = line2.length > maxLength ? line2.substring(0, maxLength) + "..." : line2;
        
        if (line1) {
          node.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "1.2em")
            .attr("font-size", "11px")
            .attr("font-weight", "600")
            .attr("fill", "#ffffff")
            .attr("pointer-events", "none")
            .text(line1);
        }
        
        if (line2) {
          node.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "2.2em")
            .attr("font-size", "11px")
            .attr("font-weight", "600")
            .attr("fill", "#ffffff")
            .attr("pointer-events", "none")
            .text(line2);
        }
      }
    });

    // Add product count below name
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", d => {
        const nameLength = d.name.length;
        const wordCount = d.name.split(' ').length;
        if (nameLength <= 12) {
          return "2.6em";
        } else if (wordCount === 1 || nameLength <= 24) {
          return "2.6em";
        } else {
          return "3.2em";
        }
      })
      .attr("font-size", "10px")
      .attr("fill", "#f1f5f9")
      .attr("pointer-events", "none")
      .text(d => `${d.count} products`);

    // Add hover effects
    node.on("mouseover", function(event, d) {
      d3.select(this).select("circle")
        .attr("r", parseFloat(d3.select(this).select("circle").attr("r")) * 1.1);
    })
    .on("mouseout", function(event, d) {
      d3.select(this).select("circle")
        .attr("r", 30 + Math.log(d.count + 1) * 6);
    });

    // Update positions on each tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Cleanup function
    return () => {
      simulation.stop();
    };
  }, [categories, dimensions, onCategorySelect, selectedCategory]);

  // Helper function to get category level in hierarchy
  const getCategoryLevel = (category, allCategories) => {
    if (!category.parentId) return 0;
    const parent = allCategories.find(c => c.id === category.parentId);
    return parent ? 1 + getCategoryLevel(parent, allCategories) : 0;
  };

  // Helper function to get color by level with enhanced palette
  const getColorByLevel = (level) => {
    const colors = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"];
    return colors[level % colors.length];
  };

  // Drag functions for force simulation
  const drag = (simulation) => {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Interactive Category Hierarchy
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Visualize and manage your category structure
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => onCategoryEdit && selectedCategory && onCategoryEdit(selectedCategory)}
            disabled={!selectedCategory}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
              selectedCategory 
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" 
                : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
          >
            Edit Selected
          </button>
        </div>
      </div>
      
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <svg ref={svgRef} className="w-full rounded-lg"></svg>
      </div>
      
      {selectedCategory && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-blue-200 dark:border-gray-600">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl">
              {selectedCategory.icon}
            </div>
            <div className="ml-4">
              <h4 className="font-bold text-lg text-gray-900 dark:text-white">{selectedCategory.name}</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {selectedCategory.count} products
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Level {selectedCategory.level}
                </span>
                {selectedCategory.parentId && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    Has parent
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Drag & Reposition</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Move categories to organize</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Click to Select</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">View details and edit</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5"></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Circle Size</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Represents product count</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryMap;