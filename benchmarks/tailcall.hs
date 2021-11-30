import Data.Word

loop :: Word32 -> Word32
loop 0 = 42
loop n = loop (n - 1)

main = print $ loop 1000000000

