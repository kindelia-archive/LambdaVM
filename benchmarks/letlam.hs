{-# LANGUAGE RankNTypes #-}

data N = Z | S N

slow :: N -> (forall a . a -> a)

slow Z =
  \x -> x

slow (S n) =
  let rec = \x -> (x (slow n))
  in ((rec (\x -> x)) (rec (\x -> x)))

main :: IO ()
main = print ((slow (S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(Z)))))))))))))))))))))))))))))) 42)
