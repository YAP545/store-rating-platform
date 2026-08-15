import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ value = 0, onChange, readOnly = false, size = 20 }) => {
  const [hoverValue, setHoverValue] = useState(0);

  const displayValue = hoverValue || value;

  return (
    <div className="star-container">
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFilled = starIndex <= Math.round(displayValue);
        return (
          <Star
            key={starIndex}
            size={size}
            className={`star-icon ${isFilled ? 'filled' : 'empty'} ${
              !readOnly ? 'interactive' : ''
            }`}
            onClick={() => !readOnly && onChange && onChange(starIndex)}
            onMouseEnter={() => !readOnly && setHoverValue(starIndex)}
            onMouseLeave={() => !readOnly && setHoverValue(0)}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
