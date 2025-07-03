import java.util.*;
public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
       int n=nums.length;
    HashMap<Integer,Integer> map=new HashMap<>();
    int ans[]=new int[2];
    for(int i=0;i<n;i++){
        if(map.containsKey(target-nums[i])){
            ans[0]=i;
            ans[1]=map.get(target-nums[i]);
            break;
        }
        map.put(nums[i],i);
    }
    Arrays.sort(ans);
    return ans;
    }

    public static void main(String[] args) {
        int[] nums = new int[]{2,7,11,15};
        int target = 9;
        Solution solution = new Solution();
        int[] result = solution.twoSum(nums, target);
        System.out.print("[");
        for (int i = 0; i < result.length; i++) {
            System.out.print(result[i]);
            if (i + 1 < result.length) System.out.print(",");
        }
        System.out.println("]");
    }
}