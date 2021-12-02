import Data.Word

data List a = Cons a (List a) | Nil

filter_ :: (a -> Word32) -> List a -> List a
filter_ fn (Cons x xs) = filter_cons (fn x) fn x xs where
  filter_cons 1 fn x xs = Cons x (filter_ fn xs)
  filter_cons 0 fn x xs = filter_ fn xs
filter_ fn Nil = Nil

concat_ Nil b = b
concat_ (Cons ah at) b = Cons ah (concat_ at b)

quicksort_ :: List Word32 -> List Word32
quicksort_ Nil = Nil
quicksort_ (Cons h t) =
  let min = filter_ (\x -> if x < h then 1 else 0) t in
  let max = filter_ (\x -> if x > h then 1 else 0) t in
  (concat_ (quicksort_ min) (Cons h (quicksort_ max)))

generate_ :: Word32 -> Word32 -> List Word32
generate_ seed 0 = Nil
generate_ seed n = Cons seed (generate_ ((seed * 1664525) + 1013904223) (n - 1))

sum_ :: List Word32 -> Word32
sum_ Nil         = 0
sum_ (Cons x xs) = x + (sum_ xs)

slow_ :: Word32 -> Word32
slow_ n = slow_go n 0 where
  slow_go 0 r = r
  slow_go n r = slow_go (n - 1) (r + (sum_ (quicksort_ (generate_ n 2500))))

main :: IO ()
main = do
  print (slow_ 400)

