import { Skeleton } from "./ui/skeleton";

type SkeletonSchemaProps = {
 grid: number   // You can add any props you want to customize the skeleton here
}

const SkeletonSchema = (props: SkeletonSchemaProps) => {
    return (
        Array.from({ length: props.grid }).map((_, index) => (
            <div key={index} className="w-full h-96 bg-gray-300 animate-pulse rounded-md">
                <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-[250px] rounded" />
                </div>
            </div>
        )
        ))
}

export default SkeletonSchema;