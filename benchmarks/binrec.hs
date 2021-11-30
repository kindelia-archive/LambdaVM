{-# LANGUAGE RankNTypes #-}

data T = E | O T | I T

slow :: T -> (forall a . a -> a)
slow E        = \x -> x
slow (O pred) = (slow pred) (slow pred)
slow (I pred) = (slow pred) (slow pred)

main =
  print [
    (slow (O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(E))))))))))))))))))))))))))) 0),
    (slow (O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(E))))))))))))))))))))))))))) 1),
    (slow (O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(O(E))))))))))))))))))))))))))) 2),
    (slow (O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(I(E))))))))))))))))))))))))))) 3),
    (slow (O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(O(O(E))))))))))))))))))))))))))) 4),
    (slow (O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(O(I(E))))))))))))))))))))))))))) 5),
    (slow (O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(I(O(E))))))))))))))))))))))))))) 6),
    (slow (O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(I(I(E))))))))))))))))))))))))))) 7)
  ]
