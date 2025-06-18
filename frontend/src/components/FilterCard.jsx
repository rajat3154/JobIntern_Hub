import React from "react";
import { Label } from "./ui/label";

const filterData = [
  {
    filterType: "Location",
    key: "location",
    array: ["Delhi NCR", "Bangalore", "Hyderabad", "Pune", "Mumbai"],
  },
  {
    filterType: "Type",
    key: "type",
    array: ["Remote", "In-Office"],
  },
  {
    filterType: "Duration",
    key: "duration",
    array: ["1 month", "3 months", "6 months"],
  },
  {
    filterType: "Stipend",
    key: "stipend",
    array: ["0-5000", "5001-10000", "10001+"],
  },
];

const FilterCard = ({ selectedFilters = {}, setSelectedFilters }) => {
  const handleChange = (key, value) => {
    setSelectedFilters((prev) => {
      const current = prev[key] || [];
      const exists = current.includes(value);
      const updated = exists
        ? current.filter((v) => v !== value)
        : [...current, value];
      return {
        ...prev,
        [key]: updated,
      };
    });
  };

  return (
    <div className="w-full bg-black p-6 rounded-lg shadow-lg">
      {filterData.map((data, index) => (
        <div key={index} className="mb-6">
          <h2 className="font-semibold text-md text-white">
            {data.filterType}
          </h2>
          <div className="space-y-2 mt-3">
            {data.array.map((item, idx) => {
              const itemId = `id-${data.key}-${idx}`;
              const checked = (selectedFilters[data.key] || []).includes(item);
              return (
                <div key={itemId} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={itemId}
                    value={item}
                    checked={checked}
                    onChange={() => handleChange(data.key, item)}
                    className="cursor-pointer w-5 h-5 rounded border-2 border-white focus:ring-2 focus:ring-blue-500"
                  />
                  <Label
                    htmlFor={itemId}
                    className="text-sm text-white cursor-pointer hover:text-blue-500"
                  >
                    {item}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FilterCard;
