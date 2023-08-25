import { useAppSelector } from "@/app/hooks";
import * as interactivitySlice from "../Interactivity/interactivitySlice";
import { useMemo } from "react";
import { TransactionData } from "../../utilities/DataObject";

export default function useCategoryOrderMap() {
  const categoryOrderArr = useAppSelector(
    interactivitySlice.selectCategoryOrderArrMemorised
  );
  const categoryOrderMap: Map<TransactionData["category"], number> =
    useMemo(() => {
      const categoryOrderMap = new Map<TransactionData["category"], number>();
      categoryOrderArr.forEach((category, index) => {
        categoryOrderMap.set(category, index);
      });
      return categoryOrderMap;
    }, [categoryOrderArr]);
  return categoryOrderMap;
}
